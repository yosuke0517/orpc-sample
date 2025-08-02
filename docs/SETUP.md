# セットアップガイド

## 概要

このプロジェクトは Next.js 15 + oRPC + PostgreSQL を使用した TypeScript CRUD アプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js 15 (App Router), React 19, TypeScript
- **バックエンド**: oRPC (type-safe RPC), OpenAPI
- **データベース**: PostgreSQL 16 (Docker)
- **スタイル**: Tailwind CSS v4
- **リンター/フォーマッター**: Biome
- **バリデーション**: Zod

## 前提条件

- Node.js 18以上
- Docker & Docker Compose
- pnpm (推奨) または npm

## セットアップ手順

### 1. 依存関係のインストール

```bash
pnpm install
# または
npm install
```

### 2. データベース起動

PostgreSQL データベースを Docker で起動します：

```bash
# バックグラウンドで起動
docker-compose up -d

# ログを確認したい場合
docker-compose up
```

データベース設定:
- ホスト: `localhost:5432`
- データベース名: `orpc_todo`
- ユーザー: `postgres`
- パスワード: `password`

### 3. アプリケーション起動

```bash
pnpm dev
# または
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 利用可能なコマンド

### 開発

```bash
pnpm dev          # 開発サーバー起動
pnpm build        # プロダクションビルド
pnpm start        # プロダクションサーバー起動
pnpm typecheck    # TypeScript型チェック
pnpm lint         # ESLint実行
pnpm format       # Biomeフォーマッター実行
pnpm check        # Biome全体チェック
```

### データベース操作

```bash
# データベース起動
docker-compose up -d

# データベース停止
docker-compose down

# データベース再起動
docker-compose restart

# データベースログ確認
docker-compose logs postgres

# データベースに接続
docker-compose exec postgres psql -U postgres -d orpc_todo
```

### データベース管理

```bash
# データベースとボリュームを完全削除
docker-compose down -v

# データベースを初期状態にリセット
docker-compose down -v && docker-compose up -d
```

## API エンドポイント

oRPC により以下のエンドポイントが自動生成されます：

- `POST /api/orpc/todos/list` - Todo一覧取得
- `POST /api/orpc/todos/create` - Todo作成
- `POST /api/orpc/todos/update` - Todo更新
- `POST /api/orpc/todos/delete` - Todo削除
- `POST /api/orpc/todos/getById` - ID指定でTodo取得
- `POST /api/orpc/todos/toggle` - Todo完了状態切り替え

OpenAPI仕様書は http://localhost:3000/api/orpc で確認できます。

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── api/orpc/          # oRPC API ハンドラー
│   └── page.tsx           # メインページ
├── features/todos/        # Todo機能
│   ├── api/              # API層 (oRPCルーター)
│   ├── components/       # React コンポーネント
│   └── types/           # TypeScript型定義
└── lib/                  # 共通ライブラリ
    └── orpc/            # oRPC設定
```

## トラブルシューティング

### データベース接続エラー

```bash
# Dockerコンテナの状態確認
docker-compose ps

# PostgreSQLログ確認
docker-compose logs postgres
```

### ポート競合

デフォルトポートが使用中の場合：

```bash
# Next.js (3000番ポート変更)
pnpm dev -- -p 3001

# PostgreSQL (5432番ポート変更)
# docker-compose.yml の ports を編集
```

### 型エラー

```bash
# TypeScript型チェック実行
pnpm typecheck

# node_modules再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 停止手順

### 1. アプリケーション停止

開発サーバーを `Ctrl+C` で停止

### 2. データベース停止

```bash
# データベース停止 (データは保持)
docker-compose down

# データベースとデータを完全削除
docker-compose down -v
```

## 注意事項

- データベースのデータは Docker ボリューム (`postgres_data`) に永続化されます
- `docker-compose down -v` でボリュームごと削除するとデータが失われます
- 本番環境では環境変数でデータベース接続情報を設定してください