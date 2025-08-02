# Next.js + oRPC + TypeScript CRUD Project

## プロジェクト概要

Next.js App Router、oRPC、TypeScriptを使用した型安全なTodo CRUDアプリケーション。bulletproof-reactのディレクトリ構成を参考に、保守性の高いアーキテクチャを採用。

## 完了したタスク

- [x] Next.js プロジェクト初期化（TypeScript + App Router + Tailwind CSS）
- [x] 依存関係インストール（oRPC、Biome、Zod等）
- [x] bulletproof-react風ディレクトリ構成の作成
- [x] oRPC設定とクライアント/サーバー構成
- [x] Todo型定義とZodスキーマ
- [x] Todo CRUD API実装（oRPCベース）
- [x] UIコンポーネント実装（Tailwind CSS）
- [x] Todo関連コンポーネント実装
- [x] Biome設定とnpmスクリプト追加

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **API**: oRPC (型安全なRPCライブラリ)
- **スタイリング**: Tailwind CSS
- **バリデーション**: Zod
- **リンター/フォーマッター**: Biome

## TypeScriptルール

1. **any型の禁止**: `any`は使用せず、`unknown`と型ガードを活用
2. **as最小化**: 型アサーションは避け、型ガード関数を優先
3. **satisfies積極利用**: オブジェクトリテラルの型チェックに活用

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   └── api/[[...orpc]]/   # oRPC APIルート
├── features/              # 機能別モジュール
│   └── todos/            # TODO機能
│       ├── api/          # API実装（router, store）
│       ├── components/   # TODO関連コンポーネント
│       └── types/        # TODO型定義
├── components/           # 共通UIコンポーネント
│   └── ui/              # 基本UIコンポーネント
├── lib/                 # ライブラリ設定
│   └── orpc/           # oRPC設定
└── utils/              # ユーティリティ
```

## 主要ファイル

### API Layer
- `src/features/todos/api/router.ts`: Todo CRUD APIルーター
- `src/features/todos/api/store.ts`: メモリストア（デモ用）
- `src/app/api/[[...orpc]]/route.ts`: Next.js APIルートハンドラー

### Type Definitions
- `src/features/todos/types/todo.ts`: Todo型とスキーマ定義

### UI Components
- `src/components/ui/`: 基本UIコンポーネント（Button, Input, Card等）
- `src/features/todos/components/`: Todo関連コンポーネント

### Configuration
- `biome.json`: Biome設定（any禁止、TypeScript厳格ルール）
- `.claude/`: Claude Code設定（フック、サブエージェント）

## 次のステップ

1. メインページの実装（`src/app/page.tsx`）
2. oRPCクライアント統合とReact Query連携
3. エラーハンドリングとローディング状態の改善
4. テスト実装
5. データベース統合（現在はメモリストア）

## 開発コマンド

```bash
npm run dev        # 開発サーバー起動
npm run build      # プロダクションビルド
npm run format     # コードフォーマット
npm run check      # Biomeチェック
npm run typecheck  # 型チェック
```

## 特徴

- **型安全**: oRPCによりAPI呼び出しが完全に型安全
- **モジュラー設計**: featuresベースのディレクトリ構成
- **品質保証**: Biomeによる厳格なリンティング・フォーマット
- **開発効率**: Claude Code フック・サブエージェントによる自動化