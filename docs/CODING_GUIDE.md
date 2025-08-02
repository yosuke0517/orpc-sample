# コーディングガイド

## 概要

このプロジェクトでは、TypeScriptとNext.js App Routerを使用したフルスタック開発のベストプラクティスに従っています。

## ガイドライン構成

本プロジェクトのコーディング規約は、以下の2つのガイドに分かれています：

### 📘 [TypeScript コーディングガイド](./TYPESCRIPT_GUIDE.md)

TypeScriptの型安全性を最大限活用するための規約：
- ファイル命名規則（キャメルケース）
- any型の禁止
- as（型アサーション）の最小化
- satisfiesの積極利用
- type aliasの優先使用
- 実装パターンとベストプラクティス

### 📗 [Next.js App Router コーディングガイド](./NEXTJS_GUIDE.md)

Next.js App RouterとoRPCを使用したフルスタック開発のガイド：
- データフェッチの最適化
- Server/Client Componentsの使い分け
- Container/Presentationalパターン
- ディレクトリ構成
- oRPC連携パターン
- 認証・認可の実装
- エラーハンドリング
- パフォーマンス最適化

## 開発フロー

1. **TypeScript規約の遵守**: `TYPESCRIPT_GUIDE.md`に従い、型安全なコードを記述
2. **Next.js パターンの適用**: `NEXTJS_GUIDE.md`に従い、最適なアーキテクチャを構築
3. **品質チェック**: 以下のコマンドで品質を確認
   ```bash
   npm run typecheck  # 型チェック
   npm run lint       # リンティング
   npm run format     # フォーマット
   npm test          # テスト実行
   ```

## クイックリファレンス

### TypeScript
- ❌ `any` → ✅ `unknown` + 型ガード
- ❌ `as` → ✅ 型ガード関数
- ❌ `interface` → ✅ `type`（特別な理由がない限り）
- ✅ `satisfies` でオブジェクトリテラルの型チェック

### Next.js
- ✅ Server Components（デフォルト）
- ✅ Client Components（インタラクティブ要素のみ）
- ✅ 並行データフェッチ（Promise.all）
- ✅ Suspense でストリーミング

### ファイル構成
```
src/
├── app/         # App Router
├── features/    # 機能別モジュール
├── components/  # 共通コンポーネント
└── lib/         # ライブラリ設定
```

詳細は各ガイドラインを参照してください。