"use server";

import { db } from "@/db";
import { consumption, inventory } from "@/db/schemas/app-schema";
import { auth } from "@/lib/auth";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { format } from "date-fns";

export async function getDailyConsumptionSummary() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // 消費ログを在庫情報と結合して取得
  const results = await db
    .select({
      date: consumption.date,
      quantity: consumption.quantity,
      totalQuantity: inventory.totalQuantity,
      purchasePrice: inventory.purchasePrice,
    })
    .from(consumption)
    .innerJoin(inventory, eq(consumption.inventoryId, inventory.id))
    .where(eq(consumption.userId, userId));

  // 日付ごとの集計ロジック (JavaScript側で行う。SQLiteの複雑な関数を避けるため)
  const summary: Record<string, number> = {};

  results.forEach((row) => {
    const dateStr = format(row.date, "yyyy-MM-dd");
    const unitPrice = row.purchasePrice / row.totalQuantity;
    const cost = Math.ceil(unitPrice * row.quantity); // 円単位なので切り上げ

    summary[dateStr] = (summary[dateStr] || 0) + cost;
  });

  return summary;
}

export async function getDashboardStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  // 今日の支出
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailyData = await db
    .select({
      quantity: consumption.quantity,
      totalQuantity: inventory.totalQuantity,
      purchasePrice: inventory.purchasePrice,
    })
    .from(consumption)
    .innerJoin(inventory, eq(consumption.inventoryId, inventory.id))
    .where(
      and(
        eq(consumption.userId, userId),
        gte(consumption.date, today),
        lte(consumption.date, tomorrow),
      ),
    );

  const todayTotal = dailyData.reduce((acc, row) => {
    return acc + Math.ceil((row.purchasePrice / row.totalQuantity) * row.quantity);
  }, 0);

  // 在庫数
  const inventoryData = await db.select().from(inventory).where(eq(inventory.userId, userId));

  return {
    todayTotal,
    inventoryCount: inventoryData.length,
  };
}

export async function getConsumptionHistory() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const results = await db
    .select({
      id: consumption.id,
      date: consumption.date,
      quantity: consumption.quantity,
      note: consumption.note,
      inventoryName: inventory.name,
      totalQuantity: inventory.totalQuantity,
      purchasePrice: inventory.purchasePrice,
      unit: inventory.unit,
    })
    .from(consumption)
    .innerJoin(inventory, eq(consumption.inventoryId, inventory.id))
    .where(eq(consumption.userId, session.user.id))
    .orderBy(sql`${consumption.date} DESC`);

  // 日付ごとにグループ化
  const groups: Record<string, { date: Date; items: any[]; total: number }> = {};

  results.forEach((row) => {
    const dateStr = format(row.date, "yyyy-MM-dd");
    const cost = Math.ceil((row.purchasePrice / row.totalQuantity) * row.quantity);

    if (!groups[dateStr]) {
      groups[dateStr] = { date: row.date, items: [], total: 0 };
    }

    groups[dateStr].items.push({
      ...row,
      cost,
    });
    groups[dateStr].total += cost;
  });

  return Object.values(groups).sort((a, b) => b.date.getTime() - a.date.getTime());
}
