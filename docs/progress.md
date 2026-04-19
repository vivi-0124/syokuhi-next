# プロジェクト進捗管理 (Progress)

## 1. 完了したタスク

### 基盤構築

- [x] プロジェクト初期化 (Next.js 16+, Tailwind CSS 4)
- [x] shadcn UI の導入
- [x] データベース設定 (Turso / LibSQL + Drizzle ORM)
- [x] 認証基盤の構築 (Better Auth)
  - [x] Google OAuth 設定
  - [x] `lib/auth.ts`, `lib/auth-client.ts` の作成
  - [x] データベースアダプター設定
- [x] 基本的なログイン/ログアウトUIの実装 (`app/page.tsx`)

---

## 2. 現在進行中のタスク

### データモデルの設計

- [x] アプリケーション固有のスキーマ定義 (`db/schemas/app-schema.ts`)
  - [x] 在庫 (Inventory)
  - [x] 消費 (Consumption)
- [x] データベースへの反映 (`drizzle-kit generate` & `migrate`)

---

## 3. 今後の予定

### UI/UX 開発

- [x] ユーザーダッシュボード画面の作成 (`/dashboard`)
- [x] カレンダー表示機能の実装 (日ごとの支出・消費可視化)
  - [x] 日付の下に金額を表示するカスタムセルを実装
- [x] 在庫追加・消費登録フォームの作成
- [ ] 料理から消費するフローの実装

### ロジック開発

- [x] 在庫数量に基づいた原価計算アルゴリズムの実装
- [x] データベースからの日次支出集計の自動化

---

## 4. 変更履歴 (Changelog)

- **2026-04-19**
  - 画面右側に現在の在庫一覧 (`InventoryList`) を表示する機能を追加。残量をバーで視覚化。
  - 在庫の追加・消費直後に最新データを自動取得する `refreshData` 処理を実装。
  - 実データに基づく日次支出集計ロジックを実装。
  - 在庫登録 (`AddInventoryDialog`) と消費記録 (`ConsumeInventoryDialog`) の機能を実装。
  - カレンダーに日ごとの支出金額を表示する機能を実装。
  - `Calendar` コンポーネントを拡張し、`expenses` プロパティで日付ごとの金額を受け取れるように変更。
  - ダッシュボード画面 (`/dashboard`) を作成。カレンダーとサマリーUIを実装。
  - shadcn UI コンポーネント (`calendar`, `card`, `popover`, `separator`) を導入。
  - `date-fns` を導入（カレンダーの日付操作用）。
  - データベースへのマイグレーションを実行し、アプリ用スキーマを物理反映。
  - アプリ用スキーマ (`db/schemas/app-schema.ts`) を作成。在庫と消費量を管理可能に。
  - `db/index.ts` にアプリ用スキーマを統合。
  - `AGENTS.md` に進捗管理のルールを追加。
  - 進捗管理ドキュメント (`docs/progress.md`) を作成。
  - Google OAuth による認証機能の実装・検証完了。
