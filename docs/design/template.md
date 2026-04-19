# 設計書テンプレート

## 1. システム構成

- **フロントエンド:** Next.js (App Router)
- **UIライブラリ:** shadcn/ui
- **データベース / ORM:** PostgreSQL / Drizzle ORM
- **デプロイ先:**

## 2. 画面設計

- [ ] **画面名:**
  - **パス:** `/path/to/page`
  - **主要コンポーネント (shadcn/ui):**
    - `Button`, `Card`, `Table` 等
  - **機能概要:**

## 3. データモデル設計 (Drizzle)

```typescript
// db/schema.ts の定義案
// Example:
// export const table = pgTable("table_name", { ... });
```

## 4. コンポーネント設計・ロジック

- **Server Actions:**
  - `actionName`: 役割と引数
- **Hooks / Context:**
- **Shared Components:**

## 5. API設計 (必要な場合)

- **Endpoint:**
- **Method:**
- **Request / Response:**

## 6. その他

- **バリデーション:** (Zod 等)
- **エラーハンドリング方針:**
- **パフォーマンス考慮事項:**
