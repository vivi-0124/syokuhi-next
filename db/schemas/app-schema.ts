import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";

/**
 * 在庫テーブル (Inventory)
 * 購入した食材や商品を管理します。
 */
export const inventory = sqliteTable(
  "inventory",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),

    // 数量管理
    totalQuantity: real("total_quantity").notNull(), // 購入時の総量
    remainingQuantity: real("remaining_quantity").notNull(), // 残量
    unit: text("unit").notNull(), // 単位 (枚, g, ml, 個 など)

    // 価格・購入情報
    purchasePrice: integer("purchase_price").notNull(), // 購入価格 (円)
    purchaseDate: integer("purchase_date", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    expiryDate: integer("expiry_date", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("inventory_userId_idx").on(table.userId)],
);

/**
 * 消費ログテーブル (Consumption)
 * 在庫からどれだけ消費したかを記録します。
 */
export const consumption = sqliteTable(
  "consumption",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    inventoryId: text("inventory_id")
      .notNull()
      .references(() => inventory.id, { onDelete: "cascade" }),

    quantity: real("quantity").notNull(), // 消費量
    date: integer("date", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    note: text("note"), // メモ (例: 朝食、夕食)
    cookingLogId: text("cooking_log_id").references(() => cookingLog.id, {
      onDelete: "cascade",
    }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("consumption_userId_idx").on(table.userId),
    index("consumption_inventoryId_idx").on(table.inventoryId),
    index("consumption_cookingLogId_idx").on(table.cookingLogId),
  ],
);

/**
 * 調理ログテーブル (CookingLog)
 * まとめて調理した際の記録を保持します。
 */
export const cookingLog = sqliteTable(
  "cooking_log",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    dishName: text("dish_name").notNull(),
    yieldQuantity: real("yield_quantity").notNull(),
    unit: text("unit").notNull(),
    totalCost: integer("total_cost").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index("cookingLog_userId_idx").on(table.userId)],
);

// リレーション定義
export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  user: one(user, {
    fields: [inventory.userId],
    references: [user.id],
  }),
  consumptions: many(consumption),
}));

export const consumptionRelations = relations(consumption, ({ one }) => ({
  user: one(user, {
    fields: [consumption.userId],
    references: [user.id],
  }),
  inventory: one(inventory, {
    fields: [consumption.inventoryId],
    references: [inventory.id],
  }),
  cookingLog: one(cookingLog, {
    fields: [consumption.cookingLogId],
    references: [cookingLog.id],
  }),
}));

export const cookingLogRelations = relations(cookingLog, ({ one, many }) => ({
  user: one(user, {
    fields: [cookingLog.userId],
    references: [user.id],
  }),
  ingredients: many(consumption),
}));

export const userAppRelations = relations(user, ({ many }) => ({
  inventories: many(inventory),
  consumptions: many(consumption),
  cookingLogs: many(cookingLog),
}));
