"use server";

import { db } from "@/db";
import { inventory, consumption, cookingLog } from "@/db/schemas/app-schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addInventory(data: {
  name: string;
  totalQuantity: number;
  unit: string;
  purchasePrice: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const id = crypto.randomUUID();
  await db.insert(inventory).values({
    id,
    userId: session.user.id,
    name: data.name,
    totalQuantity: data.totalQuantity,
    remainingQuantity: data.totalQuantity,
    unit: data.unit,
    purchasePrice: data.purchasePrice,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function consumeInventory(data: {
  inventoryId: string;
  quantity: number;
  note?: string;
  date?: Date;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const inv = await db.query.inventory.findFirst({
    where: eq(inventory.id, data.inventoryId),
  });

  if (!inv) throw new Error("Inventory not found");
  if (inv.remainingQuantity < data.quantity) {
    throw new Error("Insufficient quantity");
  }

  // 消費ログを追加
  await db.insert(consumption).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    inventoryId: data.inventoryId,
    quantity: data.quantity,
    date: data.date || new Date(),
    note: data.note,
  });

  // 在庫を減らす
  await db
    .update(inventory)
    .set({
      remainingQuantity: inv.remainingQuantity - data.quantity,
      updatedAt: new Date(),
    })
    .where(eq(inventory.id, data.inventoryId));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function cookDish(data: {
  dishName: string;
  yieldQuantity: number;
  unit: string;
  ingredients: { inventoryId: string; quantity: number }[];
  date?: Date;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  // 使用する食材の在庫情報を一括取得
  const inventoryIds = data.ingredients.map((i) => i.inventoryId);
  const inventoryList = await db.query.inventory.findMany({
    where: (inventory, { inArray, and }) =>
      and(eq(inventory.userId, session.user.id), inArray(inventory.id, inventoryIds)),
  });

  let totalCost = 0;

  // 1. コスト計算とバリデーション
  for (const ingredient of data.ingredients) {
    const inv = inventoryList.find((i) => i.id === ingredient.inventoryId);
    if (!inv || inv.remainingQuantity < ingredient.quantity) {
      throw new Error(`Insufficient quantity for ${inv?.name || "unknown item"}`);
    }
    totalCost += (inv.purchasePrice / inv.totalQuantity) * ingredient.quantity;
  }

  // 2. 調理ログの作成
  const cookingLogId = crypto.randomUUID();
  await db.insert(cookingLog).values({
    id: cookingLogId,
    userId: session.user.id,
    dishName: data.dishName,
    yieldQuantity: data.yieldQuantity,
    unit: data.unit,
    totalCost: Math.ceil(totalCost),
    createdAt: data.date || new Date(),
  });

  // 3. 食材の消費記録と在庫更新
  for (const ingredient of data.ingredients) {
    const inv = inventoryList.find((i) => i.id === ingredient.inventoryId)!;

    await db.insert(consumption).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      inventoryId: ingredient.inventoryId,
      quantity: ingredient.quantity,
      date: data.date || new Date(),
      note: `${data.dishName} の調理に使用`,
      cookingLogId: cookingLogId,
    });

    await db
      .update(inventory)
      .set({
        remainingQuantity: inv.remainingQuantity - ingredient.quantity,
        updatedAt: new Date(),
      })
      .where(eq(inventory.id, ingredient.inventoryId));
  }

  // 4. 新しい在庫アイテム（料理）の作成
  await db.insert(inventory).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    name: data.dishName,
    totalQuantity: data.yieldQuantity,
    remainingQuantity: data.yieldQuantity,
    unit: data.unit,
    purchasePrice: Math.ceil(totalCost),
    purchaseDate: data.date || new Date(),
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/cooking");
  return { success: true };
}

export async function deleteInventory(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  await db.delete(inventory).where(eq(inventory.id, id));

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getActiveInventory() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  return await db.query.inventory.findMany({
    where: eq(inventory.userId, session.user.id),
    orderBy: (inventory, { desc }) => [desc(inventory.createdAt)],
  });
}

export async function getCookingHistory() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  return await db.query.cookingLog.findMany({
    where: eq(cookingLog.userId, session.user.id),
    with: {
      ingredients: {
        with: {
          inventory: true,
        },
      },
    },
    orderBy: (cookingLog, { desc }) => [desc(cookingLog.createdAt)],
  });
}
