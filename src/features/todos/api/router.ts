import { z } from 'zod'
import { orpcServer } from '@/lib/orpc/server'
import { 
  CreateTodoSchema, 
  UpdateTodoSchema,
} from '../types/todo'
import { todoStore } from './store'

// Todo CRUD APIルーターの定義
export const todoRouter = {
  todos: {
    // 全てのTodoを取得
    list: orpcServer
      .input(z.object({}))
      .handler(async () => {
        return await todoStore.getAll()
      }),

    // IDでTodoを取得
    getById: orpcServer
      .input(z.object({ id: z.string().uuid() }))
      .handler(async ({ input }) => {
        return await todoStore.getById(input.id)
      }),

    // 新しいTodoを作成
    create: orpcServer
      .input(CreateTodoSchema)
      .handler(async ({ input }) => {
        return await todoStore.create(input)
      }),

    // Todoを更新
    update: orpcServer
      .input(z.object({
        id: z.string().uuid(),
        data: UpdateTodoSchema,
      }))
      .handler(async ({ input }) => {
        return await todoStore.update(input.id, input.data)
      }),

    // Todoを削除
    delete: orpcServer
      .input(z.object({ id: z.string().uuid() }))
      .handler(async ({ input }) => {
        const success = await todoStore.delete(input.id)
        return { success }
      }),

    // 完了/未完了を切り替え
    toggle: orpcServer
      .input(z.object({ id: z.string().uuid() }))
      .handler(async ({ input }) => {
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