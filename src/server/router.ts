import { todoRouter } from '@/features/todos/api/router'

// 中央ルーター：全てのfeatureのルーターを統合
export const router = {
  ...todoRouter,
  // 将来的に他のfeatureのルーターもここに追加
  // ...userRouter,
  // ...authRouter,
  // ...etc
}

// ルーターの型をエクスポート
export type AppRouter = typeof router