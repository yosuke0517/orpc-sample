# Next.js App Router コーディングガイド (oRPC連携)

## 概要

Next.js App Routerは、現代のWebアプリケーション開発において強力なツールであり、特にフルスタック開発においてその真価を発揮します。このガイドでは、Next.jsの主要な考え方と、型安全なAPI開発を簡素化するoRPCを組み合わせて開発を進めるためのベストプラクティスを提供します。

## 1. データフェッチの最適化

### Server Componentsでのデータフェッチ

Server Componentsは、ビルド時またはリクエスト時にサーバー上でデータをフェッチし、レンダーすることができます。これにより、クライアントへのJavaScriptバンドルサイズを減らし、初回ロードパフォーマンスを向上させます。

```typescript
// ✅ Good: Server Component でのデータフェッチ
// src/app/users/page.tsx
export default async function UsersPage() {
  // サーバー側で直接データフェッチ
  const users = await db.user.findMany();
  
  return <UserList users={users} />;
}

// ❌ Bad: 不必要なClient Component化
'use client';
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users').then(/* ... */);
  }, []);
  
  return <UserList users={users} />;
}
```

### 並行データフェッチ

複数のデータフェッチを同時に行うことで、ウォーターフォールを避け、全体のデータロード時間を短縮します。

```typescript
// ✅ Good: 並行フェッチ
export default async function DashboardPage() {
  // Promise.all で並行実行
  const [users, posts, comments] = await Promise.all([
    db.user.findMany(),
    db.post.findMany(),
    db.comment.findMany(),
  ]);
  
  return <Dashboard users={users} posts={posts} comments={comments} />;
}

// ❌ Bad: ウォーターフォール
export default async function DashboardPage() {
  const users = await db.user.findMany();
  const posts = await db.post.findMany(); 
  const comments = await db.comment.findMany();
  
  return <Dashboard users={users} posts={posts} comments={comments} />;
}
```

## 2. コンポーネント設計

### Server/Client Components の使い分け

サーバーコンポーネントとクライアントコンポーネントを適切に使い分けることが重要です。

```typescript
// ✅ Good: Server Component (デフォルト)
// src/components/userProfile.tsx
export function UserProfile({ userId }: { userId: string }) {
  return <div>User: {userId}</div>;
}

// ✅ Good: Client Component (インタラクティブ要素のみ)
// src/components/likeButton.tsx
'use client';

export function LikeButton({ postId }: { postId: string }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
```

**Client Componentsのユースケース**:
- useState, useEffectなどのReact Hooksを使用
- イベントリスナーが必要
- ブラウザAPIにアクセスする必要がある
- インタラクティブなUI要素

### Container/Presentational パターン

ロジックとUIの関心事を分離するために、Container（データ取得・ロジック）とPresentational（UI表示）コンポーネントに分けるパターンが有効です。

```typescript
// ✅ Good: Container Component
// src/app/posts/[id]/page.tsx
export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await db.post.findUnique({ where: { id: params.id } });
  const comments = await db.comment.findMany({ where: { postId: params.id } });
  
  return <PostDetail post={post} comments={comments} />;
}

// ✅ Good: Presentational Component  
// src/components/postDetail.tsx
type Props = {
  post: Post;
  comments: Comment[];
};

export function PostDetail({ post, comments }: Props) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <CommentList comments={comments} />
    </article>
  );
}
```

## 3. ディレクトリ構成

Container 1stな設計とディレクトリ構成により、ルートレベルのレイアウトやページを「コンテナ」として扱い、その中で必要なデータフェッチやロジックを集約します。

```
src/
├── app/                          # App Router
│   ├── (auth)/                   # Route Group（認証関連）
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Route Group（ダッシュボード）
│   │   ├── layout.tsx            # 共通レイアウト
│   │   ├── page.tsx              # ダッシュボードホーム
│   │   └── users/
│   │       └── page.tsx
│   └── api/
│       └── orpc/
│           └── [...orpc]/        # oRPC ハンドラー
│               └── route.ts
├── features/                     # 機能別モジュール
│   ├── auth/                     # 認証機能
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── users/                    # ユーザー機能
│       ├── api/                  # oRPC ルーター
│       │   └── router.ts
│       ├── components/
│       └── types/
├── components/                   # 共通コンポーネント
│   └── ui/
└── lib/                         # ライブラリ設定
    ├── orpc/
    └── dal/                     # Data Access Layer
        └── auth.ts
```

## 4. oRPC連携パターン

oRPCは、RPCとOpenAPIを組み合わせ、エンドツーエンドで型安全なAPIを簡単に構築できるように設計されています。

### oRPCルーター定義

```typescript
// src/features/users/api/router.ts
import { z } from 'zod';
import { orpcServer } from '@/lib/orpc/server';
import { verifySession } from '@/lib/dal/auth';

export const userRouter = {
  users: {
    // 認証が必要なエンドポイント
    list: orpcServer
      .use(async (input, context, meta) => {
        // ミドルウェアで認証チェック
        const session = await verifySession();
        if (!session) throw new Error('Unauthorized');
        
        return { ...meta, session };
      })
      .input(z.object({ 
        page: z.number().default(1),
        limit: z.number().default(10) 
      }))
      .handler(async ({ input, meta }) => {
        return await db.user.findMany({
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        });
      }),
      
    // 公開エンドポイント  
    getById: orpcServer
      .input(z.object({ id: z.string().uuid() }))
      .handler(async ({ input }) => {
        return await db.user.findUnique({ 
          where: { id: input.id } 
        });
      }),
  }
};
```

### Server Actionsとの連携

oRPCはNext.jsのReact Server Actionsと完全に互換性があります。

```typescript
// src/app/users/createUserAction.ts
'use server';

import { z } from 'zod';
import { orpc } from '@/lib/orpc/client';
import { revalidatePath } from 'next/cache';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUserAction(formData: FormData) {
  // フォームデータのバリデーション
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });
  
  if (!validatedFields.success) {
    return { 
      error: validatedFields.error.flatten().fieldErrors 
    };
  }
  
  try {
    // oRPCを通じてユーザー作成
    const user = await orpc.users.create(validatedFields.data);
    
    // キャッシュの再検証
    revalidatePath('/users');
    
    return { success: true, user };
  } catch (error) {
    return { error: 'ユーザー作成に失敗しました' };
  }
}
```

## 5. 認証・認可パターン

Next.jsでは、認証・認可のロジックをサーバー側で安全に処理することが推奨されます。

### Data Access Layer (DAL)

データリクエストと認可ロジックを一元化するためにDALを作成することが推奨されます。

```typescript
// src/lib/dal/auth.ts
import { cookies } from 'next/headers';
import { cache } from 'react';
import * as jose from 'jose';

export const verifySession = cache(async () => {
  const token = cookies().get('session')?.value;
  
  if (!token) return null;
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);
    
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
});

// 認可チェック関数
export async function canAccessResource(resourceId: string) {
  const session = await verifySession();
  
  if (!session) return false;
  
  // リソースへのアクセス権限チェック
  const hasAccess = await db.permission.findFirst({
    where: {
      userId: session.userId,
      resourceId,
    },
  });
  
  return !!hasAccess;
}
```

### Server Componentでの認証チェック

```typescript
// src/app/admin/page.tsx
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal/auth';

export default async function AdminPage() {
  const session = await verifySession();
  
  // 認証チェック
  if (!session) {
    redirect('/login');
  }
  
  // 認可チェック
  if (session.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  return <AdminDashboard />;
}
```

### セッション管理の選択肢

**ステートレスセッション**:
- セッションデータ（またはトークン）をブラウザのCookieに保存
- シンプルですが、正しく実装しないとセキュリティリスクがある
- Joseのようなライブラリを利用し、Next.jsのcookies APIでCookieを管理

**データベースセッション**:
- セッションデータをデータベースに保存
- ユーザーのブラウザには暗号化されたセッションIDのみを渡す
- より安全ですが、実装は複雑

### 🚨 重要なセキュリティ考慮事項

#### Server Component vs Client Component でのセッション処理

```typescript
// ✅ Good: Server Component でのセッション処理（安全）
// src/app/profile/page.tsx
import { verifySession } from '@/lib/dal/auth';

export default async function ProfilePage() {
  const session = await verifySession();
  
  if (!session) {
    redirect('/login');
  }
  
  // サーバー側でのみセッション情報を処理
  const user = await db.user.findUnique({ 
    where: { id: session.userId },
    select: { id: true, name: true, email: true } // 必要な情報のみ
  });
  
  return <ProfileView user={user} />;
}

// ❌ Dangerous: Client Component での直接セッション参照
'use client';
import { verifySession } from '@/lib/dal/auth'; // これは危険！

export default function ProfilePage() {
  // クライアント側でセッション情報が露出する
  const session = await verifySession(); // ❌ セキュリティリスク
  return <div>User: {session.userId}</div>;
}
```

#### Client Component で認証状態が必要な場合

```typescript
// ✅ Good: 公開可能な情報のみをPropsで渡す
// src/app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const session = await verifySession();
  
  if (!session) {
    redirect('/login');
  }
  
  // 公開可能な最小限の情報のみを抽出
  const publicUserData = {
    id: session.userId,
    name: session.name, // 表示に必要な情報のみ
    role: session.role,
  };
  
  return <DashboardClient user={publicUserData} />;
}

// ✅ Good: Client Component は公開可能な情報のみ受け取る
'use client';
type Props = {
  user: {
    id: string;
    name: string;
    role: string;
  };
};

export function DashboardClient({ user }: Props) {
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      {user.role === 'admin' && <AdminPanel />}
    </div>
  );
}
```

#### Context Provider を使う場合の注意点

```typescript
// ❌ Dangerous: 機密情報をContext で共有
'use client';
const AuthContext = createContext<{
  userId: string;
  token: string; // ❌ トークンをクライアントに露出
  permissions: string[];
}>();

// ✅ Good: 必要最小限の公開情報のみをContext で共有
'use client';
type PublicUserData = {
  id: string;
  name: string;
  role: 'user' | 'admin';
  isAuthenticated: boolean;
};

const AuthContext = createContext<PublicUserData>();

// Server Component で安全にセッションを検証し、
// 公開可能な情報のみをClient Component に渡す
export default async function RootLayout({ children }) {
  const session = await verifySession();
  
  const publicUserData: PublicUserData = session 
    ? { 
        id: session.userId, 
        name: session.name, 
        role: session.role,
        isAuthenticated: true 
      }
    : { 
        id: '', 
        name: '', 
        role: 'user', 
        isAuthenticated: false 
      };
  
  return (
    <AuthProvider value={publicUserData}>
      {children}
    </AuthProvider>
  );
}
```

#### API呼び出し時の認証

```typescript
// ✅ Good: Server Action での認証済みAPI呼び出し
'use server';
export async function updateUserProfile(formData: FormData) {
  // サーバー側で認証検証
  const session = await verifySession();
  if (!session) throw new Error('Unauthorized');
  
  // 認証済みユーザーとして処理
  return await orpc.users.update({
    id: session.userId,
    data: { name: formData.get('name') as string }
  });
}

// ❌ Bad: クライアント側での認証情報の処理
'use client';
export function UpdateProfileForm() {
  const handleSubmit = async (formData: FormData) => {
    // ❌ クライアント側でトークンを処理するのは危険
    const token = getTokenFromStorage(); 
    
    await fetch('/api/users/update', {
      headers: { Authorization: `Bearer ${token}` } // ❌ 露出リスク
    });
  };
}
```

## 6. エラーハンドリング

適切でユーザーフレンドリーなエラーハンドリングを実装することは、堅牢なアプリケーションにとって不可欠です。

### エラーバウンダリー

```typescript
// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={reset}>再試行</button>
    </div>
  );
}
```

### oRPCエラーハンドリング

oRPCはORPCErrorをスローできるため、Next.jsのエラー処理と連携させることが可能です。

```typescript
// src/lib/orpc/errorHandler.ts
import { ORPCError } from '@orpc/server';

export function handleORPCError(error: unknown) {
  if (error instanceof ORPCError) {
    // oRPCエラーの処理
    return new Response(
      JSON.stringify({
        error: error.message,
        code: error.code,
      }),
      { status: error.status || 500 }
    );
  }
  
  // その他のエラー
  console.error('Unexpected error:', error);
  return new Response(
    JSON.stringify({ error: 'Internal Server Error' }),
    { status: 500 }
  );
}
```

## 7. パフォーマンス最適化

### Suspense とストリーミング

データのロード中にフォールバックUIを表示し、準備ができた部分からストリーミングでコンテンツを配信することで、ユーザー体験を向上させます。

```typescript
// ✅ Good: Suspenseでの段階的レンダリング
import { Suspense } from 'react';

export default function ProductPage({ id }: { id: string }) {
  return (
    <div>
      <Suspense fallback={<ProductHeaderSkeleton />}>
        <ProductHeader id={id} />
      </Suspense>
      
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails id={id} />
      </Suspense>
      
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews id={id} />
      </Suspense>
    </div>
  );
}
```

### キャッシュ戦略

Next.jsは様々なレベルでキャッシュをサポートしており、パフォーマンス最適化に不可欠です。

```typescript
// ✅ Good: 適切なキャッシュ設定
// 静的データ（デフォルトでキャッシュ）
export async function getStaticData() {
  const res = await fetch('https://api.example.com/static-data');
  return res.json();
}

// 動的データ（キャッシュ無効化）
export async function getDynamicData() {
  const res = await fetch('https://api.example.com/dynamic-data', {
    cache: 'no-store',
  });
  return res.json();
}

// 時間ベースの再検証
export async function getRevalidatedData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 }, // 1時間ごとに再検証
  });
  return res.json();
}
```

### レンダリングの理解

**Server Componentsの純粋性**:
- サーバーコンポーネントは純粋な非同期関数として動作
- クライアントサイドの状態やエフェクトを持たない

**Static Rendering**:
- 変更頻度の低いコンテンツは静的にレンダリング
- フルルートキャッシュを利用して高速配信

**Dynamic Rendering**:
- 動的なコンテンツに対してはデータキャッシュを利用
- 再度のフェッチを減らす

**Partial Pre Rendering (PPR)** [実験的機能]:
- アプリケーションの動的な部分と静的な部分を自動的に識別
- 最適なレンダリング戦略を適用

## 参考リソース

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [oRPC Documentation](https://orpc.unnoq.com/)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)