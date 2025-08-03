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

### ⚠️ useEffectの使用上の注意

useEffectは副作用管理が複雑になりやすく、不適切な使用はパフォーマンス問題やバグの原因となります。可能な限り避け、代替手段を検討してください。

```typescript
// ❌ Bad: useEffectでのデータフェッチ
'use client';
export function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // 問題: 複雑な依存関係、メモリリークのリスク、競合状態
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []); // 依存配列の管理が困難
  
  return loading ? <div>Loading...</div> : <UserListView users={users} />;
}

// ✅ Good: Server Componentでのデータフェッチ
export default async function UserListPage() {
  // サーバー側で安全にデータフェッチ
  const users = await db.user.findMany();
  return <UserListView users={users} />;
}

// ✅ Good: Server Actionでの状態更新
'use server';
export async function toggleUserStatus(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { isActive: { not: true } }
  });
  revalidatePath('/users');
}
```

**useEffect使用時のチェックリスト**:
- [ ] Server ComponentやServer Actionで代替できないか？
- [ ] 依存配列は正しく設定されているか？
- [ ] クリーンアップ関数は必要ないか？
- [ ] 競合状態やメモリリークの可能性はないか？
- [ ] パフォーマンスへの影響は適切か？

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

## 8. oRPCで新しいドメイン機能を追加する手順

新しいドメイン（例：求人管理）のCRUD機能を追加する際の段階的な手順を説明します。

### Step 1: スキーマ定義

まず、ドメインオブジェクトのZodスキーマを定義します。

```typescript
// src/features/jobs/types/job.ts
import { z } from 'zod'

export const JobSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, '求人タイトルは必須です'),
  description: z.string().optional(),
  company: z.string().min(1, '会社名は必須です'),
  salary: z.number().min(0).optional(),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Job = z.infer<typeof JobSchema>

// フォーム用の型（idやタイムスタンプを除外）
export const CreateJobInputSchema = JobSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})
export type CreateJobInput = z.infer<typeof CreateJobInputSchema>

export const UpdateJobInputSchema = JobSchema.partial().omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})
export type UpdateJobInput = z.infer<typeof UpdateJobInputSchema>
```

### Step 2: oRPCルーターの実装

すべてのCRUD操作をoRPCルーターで定義します。

```typescript
// src/features/jobs/api/router.ts
import { z } from 'zod'
import { orpc } from '@orpc/server'
import { JobSchema, CreateJobInputSchema, UpdateJobInputSchema } from '../types/job'
import { db } from '@/lib/db'

export const jobRouter = {
  // 一覧取得
  list: orpc
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
      search: z.string().optional(),
      isActive: z.boolean().optional(),
    }))
    .output(z.object({
      jobs: z.array(JobSchema),
      total: z.number(),
    }))
    .handler(async ({ input }) => {
      const where = {
        ...(input.search && {
          OR: [
            { title: { contains: input.search, mode: 'insensitive' } },
            { company: { contains: input.search, mode: 'insensitive' } },
          ],
        }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
      }

      const [jobs, total] = await Promise.all([
        db.job.findMany({
          where,
          take: input.limit,
          skip: input.offset,
          orderBy: { createdAt: 'desc' },
        }),
        db.job.count({ where }),
      ])

      return { jobs, total }
    }),

  // 単体取得
  findById: orpc
    .input(z.object({ id: z.string().uuid() }))
    .output(JobSchema.nullable())
    .handler(async ({ input }) => {
      const job = await db.job.findUnique({
        where: { id: input.id },
      })
      return job
    }),

  // 作成
  create: orpc
    .input(CreateJobInputSchema)
    .output(JobSchema)
    .handler(async ({ input }) => {
      const job = await db.job.create({
        data: {
          ...input,
          id: crypto.randomUUID(),
        },
      })
      return job
    }),

  // 更新
  update: orpc
    .input(z.object({
      id: z.string().uuid(),
      data: UpdateJobInputSchema,
    }))
    .output(JobSchema)
    .handler(async ({ input }) => {
      const job = await db.job.update({
        where: { id: input.id },
        data: input.data,
      })
      return job
    }),

  // 削除
  delete: orpc
    .input(z.object({ id: z.string().uuid() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ input }) => {
      await db.job.delete({
        where: { id: input.id },
      })
      return { success: true }
    }),
}
```

### Step 3: メインルーターに統合

```typescript
// src/server/router.ts
import { todoRouter } from '@/features/todos/api/router'
import { jobRouter } from '@/features/jobs/api/router'

export const router = {
  todos: todoRouter,
  jobs: jobRouter, // 新しいドメインを追加
}

export type AppRouter = typeof router
```

### Step 4: Server Serviceの作成

Server Componentで使用するデータ取得サービスを作成します。

```typescript
// src/features/jobs/services/jobService.ts
import type { Job } from '../types/job'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

export async function fetchJobs(params: {
  limit?: number
  offset?: number
  search?: string
  isActive?: boolean
} = {}): Promise<{ jobs: Job[]; total: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      next: { 
        revalidate: 300, // 5分間キャッシュ
        tags: ['jobs'] 
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return { jobs: [], total: 0 }
  }
}

export async function fetchJobById(id: string): Promise<Job | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/jobs/findById`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      next: { 
        revalidate: 60,
        tags: [`job-${id}`] 
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching job:', error)
    return null
  }
}
```

### Step 5: Server Actionsの実装

CUD操作用のServer Actionsを作成します。

```typescript
// src/features/jobs/actions/jobActions.ts
'use server'

import { revalidateTag, revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { CreateJobInput, UpdateJobInput } from '../types/job'

export async function createJobAction(data: CreateJobInput) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create job: ${response.status}`)
    }

    const job = await response.json()
    
    // キャッシュを再検証
    revalidateTag('jobs')
    
    // 作成した求人詳細ページにリダイレクト
    redirect(`/jobs/${job.id}`)
  } catch (error) {
    console.error('Error creating job:', error)
    throw new Error('求人の作成に失敗しました')
  }
}

export async function updateJobAction(id: string, data: UpdateJobInput) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, data }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update job: ${response.status}`)
    }

    // キャッシュを再検証
    revalidateTag('jobs')
    revalidateTag(`job-${id}`)
    revalidatePath(`/jobs/${id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating job:', error)
    throw new Error('求人の更新に失敗しました')
  }
}

export async function deleteJobAction(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/jobs/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })

    if (!response.ok) {
      throw new Error(`Failed to delete job: ${response.status}`)
    }

    // キャッシュを再検証
    revalidateTag('jobs')
    revalidateTag(`job-${id}`)
    
    // 一覧ページにリダイレクト
    redirect('/jobs')
  } catch (error) {
    console.error('Error deleting job:', error)
    throw new Error('求人の削除に失敗しました')
  }
}
```

### Step 6: Server Componentでページを実装

```typescript
// src/app/jobs/page.tsx
import { Suspense } from 'react'
import { fetchJobs } from '@/features/jobs/services/jobService'
import { JobList } from '@/features/jobs/components/JobList'
import { CreateJobForm } from '@/features/jobs/components/CreateJobForm'
import { JobListSkeleton } from '@/features/jobs/components/JobSkeleton'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const limit = 20
  const offset = (page - 1) * limit

  const { jobs, total } = await fetchJobs({
    limit,
    offset,
    search: params.search,
    isActive: true,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">求人一覧</h1>
          <p className="text-gray-600 mt-2">
            {total}件の求人が見つかりました
          </p>
        </div>
        <CreateJobForm />
      </div>

      <Suspense fallback={<JobListSkeleton />}>
        <JobList 
          jobs={jobs} 
          total={total} 
          currentPage={page}
          limit={limit}
        />
      </Suspense>
    </div>
  )
}

// src/app/jobs/[id]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { fetchJobById } from '@/features/jobs/services/jobService'
import { JobDetail } from '@/features/jobs/components/JobDetail'
import { JobDetailSkeleton } from '@/features/jobs/components/JobSkeleton'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await fetchJobById(id)

  if (!job) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<JobDetailSkeleton />}>
        <JobDetail job={job} />
      </Suspense>
    </div>
  )
}
```

### Step 7: Client Componentの実装

```typescript
// src/features/jobs/components/CreateJobForm.tsx
'use client'

import { useState, useTransition } from 'react'
import { createJobAction } from '../actions/jobActions'
import type { CreateJobInput } from '../types/job'

export function CreateJobForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    const data: CreateJobInput = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      company: formData.get('company') as string,
      salary: Number(formData.get('salary')) || undefined,
      location: formData.get('location') as string,
      isActive: true,
    }

    startTransition(async () => {
      try {
        await createJobAction(data)
        setIsOpen(false)
      } catch (error) {
        console.error('Error:', error)
        // TODO: Show error toast
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        新しい求人を作成
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">求人作成</h2>
            
            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  求人タイトル *
                </label>
                <input
                  name="title"
                  type="text"
                  required
                  disabled={isPending}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  会社名 *
                </label>
                <input
                  name="company"
                  type="text"
                  required
                  disabled={isPending}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  勤務地
                </label>
                <input
                  name="location"
                  type="text"
                  disabled={isPending}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  給与
                </label>
                <input
                  name="salary"
                  type="number"
                  min="0"
                  disabled={isPending}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  詳細説明
                </label>
                <textarea
                  name="description"
                  rows={3}
                  disabled={isPending}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-gray-600 border rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                  {isPending ? '作成中...' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
```

## 新ドメイン追加のメリット

### 1. 統一されたアーキテクチャ
- すべてのドメインが同じパターンで実装される
- API仕様が自動生成される
- 型安全性がエンドツーエンドで保証される

### 2. 優れた開発者体験
- コード補完とIntelliSenseがフル活用できる
- APIの変更がコンパイル時に検出される
- 一貫したエラーハンドリング

### 3. パフォーマンス最適化
- Server ComponentによるSSR
- 適切なキャッシュ戦略
- Suspenseによる段階的レンダリング

### 4. 保守性
- 明確な責務分離
- テスタブルなコンポーネント構成
- 型による自己文書化

この手順に従うことで、新しいドメイン機能を素早く、安全に追加できます。

## 参考リソース

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [oRPC Documentation](https://orpc.unnoq.com/)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)