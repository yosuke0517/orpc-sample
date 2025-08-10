import { todoRouter } from '@/features/todos/api/router'

// 中央ルーター：全てのfeatureのルーターを統合
export const router = {
  todos: todoRouter.todos,
  // 将来的に他のfeatureのルーターもここに追加
  // user: userRouter.user,
  // auth: authRouter.auth,
  // ...etc
}

// ルーターの型をエクスポート
export type AppRouter = typeof router
