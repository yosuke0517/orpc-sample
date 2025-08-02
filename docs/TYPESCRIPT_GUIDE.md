# TypeScript コーディングガイド

## 概要

このプロジェクトでは TypeScript の型安全性を最大限活用し、保守性の高いコードを書くための厳格なルールを定めています。

## ファイル命名規則

### ファイル名はキャメルケース

**ルール**: すべてのファイル名はキャメルケース（camelCase）を使用します。

```bash
# ✅ Good: キャメルケース
src/components/userProfile.tsx
src/hooks/useAuth.ts
src/utils/dateFormatter.ts
src/types/apiResponse.ts

# ❌ Bad: ケバブケース
src/components/user-profile.tsx
src/hooks/use-auth.ts

# ❌ Bad: スネークケース  
src/utils/date_formatter.ts
src/types/api_response.ts

# ❌ Bad: パスカルケース（コンポーネントファイル以外）
src/utils/DateFormatter.ts
src/types/ApiResponse.ts
```

**例外**:
- 設定ファイル: `.eslintrc.json`, `next.config.js`
- マークダウン: `README.md`, `CHANGELOG.md`
- 環境変数ファイル: `.env.local`
- Next.js特殊ファイル: `_app.tsx`, `_document.tsx`

**理由**:
- JavaScript/TypeScriptのエコシステムで一般的
- importパスが自然に読める
- 大文字小文字を区別しないファイルシステムでの問題回避

## TypeScript コーディングルール

### 1. any型の禁止

**ルール**: `any`型の使用を一切禁止します。

```typescript
// ❌ Bad: any型の使用
function processData(data: any) {
  return data.value;
}

// ✅ Good: unknown型と型ガード
function processData(data: unknown) {
  if (isDataObject(data)) {
    return data.value;
  }
  throw new Error('Invalid data');
}

function isDataObject(data: unknown): data is { value: string } {
  return typeof data === 'object' && 
         data !== null && 
         'value' in data &&
         typeof (data as { value: unknown }).value === 'string';
}
```

**理由**: 
- 型安全性の確保
- IDE の補完機能活用
- ランタイムエラーの予防

**代替手段**:
- `unknown` + 型ガード
- 適切な型定義
- ジェネリクス

### 2. as（型アサーション）の最小化

**ルール**: `as`による型アサーションは可能な限り避けます。

```typescript
// ❌ Bad: asによる型アサーション
const element = document.getElementById('myId') as HTMLInputElement;

// ✅ Good: 型ガードによる絞り込み
const element = document.getElementById('myId');
if (element instanceof HTMLInputElement) {
  // elementはHTMLInputElement型として扱える
}

// ✅ Good: 型ガード関数
function isHTMLInputElement(element: Element | null): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

const element = document.getElementById('myId');
if (isHTMLInputElement(element)) {
  // 型安全にアクセス
  element.value = 'test';
}
```

**理由**:
- ランタイムでの型の不一致を防止
- より明示的な型チェック
- コードの意図が明確

**許可される例外**:
- 外部ライブラリの型定義が不完全な場合（コメント必須）
- 型システムの制限により必要な場合（コメント必須）

### 3. satisfiesの積極利用

**ルール**: オブジェクトリテラルの型チェックには`satisfies`を使用します。

```typescript
// ❌ Bad: 型注釈による型情報の損失
const config: {
  apiUrl: string;
  timeout: number;
  retries: number;
} = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

// ✅ Good: satisfiesで型推論を維持
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
} satisfies {
  apiUrl: string;
  timeout: number;
  retries: number;
};

// ✅ Good: より実用的な例
type Route = {
  path: string;
  component: string;
  methods: readonly string[];
};

const routes = {
  users: {
    path: '/users',
    component: 'UserList',
    methods: ['GET', 'POST'] as const
  },
  profile: {
    path: '/profile',
    component: 'Profile', 
    methods: ['GET', 'PUT'] as const
  }
} satisfies Record<string, Route>;

// routes.users.methods は ['GET', 'POST'] として推論される
```

**メリット**:
- 型チェックと型推論の両立
- より正確な型情報の保持
- IDEの補完精度向上

### 4. type aliasの優先使用

**ルール**: 型定義は可能な限り`type`を使用し、`interface`は必要最小限に制限します。

```typescript
// ❌ Bad: interfaceの不必要な使用
interface UserData {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: typeの使用
type UserData = {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: ユニオン型（interfaceでは不可）
type Status = 'pending' | 'completed' | 'failed';

// ✅ Good: 関数型
type EventHandler = (event: Event) => void;

// ✅ Good: 条件型
type NonNullable<T> = T extends null | undefined ? never : T;

// ✅ Good: interfaceが適切な場合（クラス実装）
interface Drawable {
  draw(): void;
}

class Circle implements Drawable {
  draw() {
    // 実装
  }
}

// ✅ Good: interfaceが適切な場合（拡張）
interface BaseConfig {
  apiUrl: string;
}

interface DatabaseConfig extends BaseConfig {
  dbUrl: string;
}
```

### type vs interface 使い分けガイド

#### typeを使用する場合（推奨）
- **一般的なオブジェクトの型定義**
- **ユニオン型**: `type Status = 'active' | 'inactive'`
- **インターセクション型**: `type User = BaseUser & Permissions`
- **プリミティブ型のエイリアス**: `type ID = string`
- **関数型の定義**: `type Handler = (data: T) => void`
- **マップ型**: `type Partial<T> = { [K in keyof T]?: T[K] }`
- **条件型**: `type NonNull<T> = T extends null ? never : T`

#### interfaceを使用する場合（限定的）
- **クラスが実装する契約の定義**（implements）
- **ライブラリの公開APIで拡張性が必要**
- **宣言マージが必要**（稀）
- **他のinterfaceからの継承が必要**

## 実装パターン

### 1. APIレスポンスの型定義

```typescript
// ✅ Good: 厳密な型定義
type ApiResponse<T> = {
  readonly data: T;
  readonly status: 'success' | 'error';
  readonly message?: string;
};

type User = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly createdAt: Date;
};

// ✅ Good: 型ガードでAPIレスポンスを検証
function isValidUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data &&
    'email' in data &&
    'createdAt' in data &&
    typeof (data as Record<string, unknown>).id === 'string' &&
    typeof (data as Record<string, unknown>).name === 'string' &&
    typeof (data as Record<string, unknown>).email === 'string' &&
    (data as Record<string, unknown>).createdAt instanceof Date
  );
}
```

### 2. 状態管理での型定義

```typescript
// ✅ Good: discriminated union
type LoadingState = {
  readonly status: 'loading';
};

type SuccessState<T> = {
  readonly status: 'success';
  readonly data: T;
};

type ErrorState = {
  readonly status: 'error';
  readonly error: string;
};

type AsyncState<T> = LoadingState | SuccessState<T> | ErrorState;

// ✅ Good: 型安全な状態処理
function handleState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      return <div>{/* state.data は T 型として安全にアクセス可能 */}</div>;
    case 'error':
      return <div>Error: {state.error}</div>;
  }
}
```

### 3. 環境変数の型安全な扱い

```typescript
// ✅ Good: 環境変数の検証
type EnvironmentVariables = {
  readonly NODE_ENV: 'development' | 'production' | 'test';
  readonly API_URL: string;
  readonly DB_URL: string;
};

function validateEnv(): EnvironmentVariables {
  const env = process.env;
  
  if (!env.NODE_ENV || !['development', 'production', 'test'].includes(env.NODE_ENV)) {
    throw new Error('Invalid NODE_ENV');
  }
  
  if (!env.API_URL) {
    throw new Error('API_URL is required');
  }
  
  if (!env.DB_URL) {
    throw new Error('DB_URL is required');
  }
  
  return {
    NODE_ENV: env.NODE_ENV as EnvironmentVariables['NODE_ENV'],
    API_URL: env.API_URL,
    DB_URL: env.DB_URL,
  };
}

// ✅ Good: 型安全な環境変数の使用
const config = validateEnv();
```

## コード品質チェック

### 必須チェック項目

1. **TypeScript型チェック**: `npm run typecheck`
2. **ESLintチェック**: `npm run lint`
3. **フォーマットチェック**: `npm run format`
4. **テスト実行**: `npm test`

### 推奨ESLintルール

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unsafe-any": "error",
  "@typescript-eslint/no-unsafe-assignment": "error",
  "@typescript-eslint/no-unsafe-call": "error",
  "@typescript-eslint/no-unsafe-member-access": "error",
  "@typescript-eslint/no-unsafe-return": "error",
  "@typescript-eslint/prefer-type-assertions": "error",
  "@typescript-eslint/consistent-type-definitions": ["error", "type"]
}
```

## 参考リソース

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [Type vs Interface in TypeScript](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)