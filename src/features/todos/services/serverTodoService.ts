import { todoStore } from '@/features/todos/api/store'
import type { Todo } from '@/features/todos/types/todo'

/**
 * サーバーサイド専用のTodoデータ取得サービス
 * SSRやサーバーコンポーネントで使用
 */

/**
 * 全てのTodoを取得（サーバーサイド）
 * ストアから直接取得してパフォーマンスを向上
 */
export async function fetchTodosServer(): Promise<Todo[]> {
  try {
    return await todoStore.getAll()
  } catch (error) {
    console.error('Error fetching todos on server:', error)
    return []
  }
}

/**
 * IDでTodoを取得（サーバーサイド）
 */
export async function fetchTodoByIdServer(id: string): Promise<Todo | null> {
  try {
    return await todoStore.getById(id)
  } catch (error) {
    console.error('Error fetching todo by id on server:', error)
    return null
  }
}
