import { z } from 'zod'
import { orpcServer } from '@/lib/orpc/server'
import { 
  CreateTodoSchema, 
  UpdateTodoSchema,
} from '../types/todo'
import { todoStore } from './store'

// Todo CRUD APIルーターの定義
// 🚨 TODO: 認証・認可の実装が必要
// 現在全てのエンドポイントが公開されており、セキュリティリスクがある
// 実装すべき項目:
// 1. 認証ミドルウェアの追加 (.use(authMiddleware))
// 2. ユーザーIDベースのデータ分離
// 3. 所有権チェック（他のユーザーのTodoの操作防止）
export const todoRouter = {
  todos: {
    // 全てのTodoを取得
    // TODO: 認証必須 + ユーザー固有のTodoのみ返却
    list: orpcServer
      .input(z.object({}))
      .handler(async () => {
        // TODO: 認証チェック + where: { userId: session.userId }
        return await todoStore.getAll()
      }),

    // IDでTodoを取得
    // TODO: 認証必須 + 所有権チェック
    getById: orpcServer
      .input(z.object({ id: z.string().min(1) }))
      .handler(async ({ input }) => {
        // TODO: 認証チェック + 所有権確認
        return await todoStore.getById(input.id)
      }),

    // 新しいTodoを作成
    // TODO: 認証必須 + ユーザーIDの自動設定
    create: orpcServer
      .input(CreateTodoSchema)
      .handler(async ({ input }) => {
        // TODO: 認証チェック + input.userId = session.userId
        return await todoStore.create(input)
      }),

    // Todoを更新
    // TODO: 認証必須 + 所有権チェック
    update: orpcServer
      .input(z.object({
        id: z.string().min(1),
        data: UpdateTodoSchema,
      }))
      .handler(async ({ input }) => {
        // TODO: 認証チェック + 所有権確認 (todo.userId === session.userId)
        return await todoStore.update(input.id, input.data)
      }),

    // Todoを削除
    // TODO: 認証必須 + 所有権チェック（重要！）
    delete: orpcServer
      .input(z.object({ id: z.string().min(1) }))
      .handler(async ({ input }) => {
        // TODO: 認証チェック + 所有権確認 - 他のユーザーのTodo削除を防ぐ
        const success = await todoStore.delete(input.id)
        return { success }
      }),

    // 完了/未完了を切り替え
    // TODO: 認証必須 + 所有権チェック
    toggle: orpcServer
      .input(z.object({ id: z.string().min(1) }))
      .handler(async ({ input }) => {
        // TODO: 認証チェック + 所有権確認
        const todo = await todoStore.getById(input.id)
        if (!todo) return null
        
        return await todoStore.update(input.id, {
          completed: !todo.completed,
        })
      }),
  }
}

// ルーターの型をエクスポート
export type TodoRouter = typeof todoRouter