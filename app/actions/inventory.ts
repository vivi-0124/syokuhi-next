"use server";

import { db } from "@/db";
import { inventory, consumption } from "@/db/schemas/app-schema";
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

export async function getActiveInventory() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  return await db.query.inventory.findMany({
    where: (and) => eq(inventory.userId, session.user.id),
    orderBy: (inventory, { desc }) => [desc(inventory.createdAt)],
  });
}
