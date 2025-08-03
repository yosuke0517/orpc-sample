import type { Todo } from '@/features/todos/types/todo'

/**
 * Todo統計計算ヘルパー
 * UIで表示するための統計データを算出
 */
export function calculateTodoStats(todos: Todo[]): {
  total: number
  completed: number
  pending: number
  completionRate: number
} {
  const total = todos.length
  const completed = todos.filter((todo) => todo.completed).length
  const pending = total - completed
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    pending,
    completionRate,
  }
}

/**
 * Todo拡張統計計算ヘルパー
 * useTodoStatsで使用する追加の統計データ
 */
export function calculateExtendedTodoStats(
  todos: Array<{ completed: boolean }>
) {
  const basic = calculateTodoStats(todos as Todo[])

  return {
    ...basic,
    hasCompletedTodos: basic.completed > 0,
    hasPendingTodos: basic.pending > 0,
    isAllCompleted: basic.total > 0 && basic.completed === basic.total,
  }
}

/**
 * Todoフィルタリングヘルパー
 * UIでのフィルタリング処理
 */
export function filterTodos(
  todos: Todo[],
  filter: {
    completed?: boolean
    search?: string
  }
): Todo[] {
  return todos.filter((todo) => {
    // Filter by completion status
    if (filter.completed !== undefined && todo.completed !== filter.completed) {
      return false
    }

    // Filter by search term
    if (filter.search) {
      const search = filter.search.toLowerCase()
      return (
        todo.title.toLowerCase().includes(search) ||
        todo.description?.toLowerCase().includes(search)
      )
    }

    return true
  })
}

/**
 * Todoソートヘルパー
 * 様々な条件でTodoをソート
 */
export function sortTodos(
  todos: Todo[],
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'completed' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Todo[] {
  return [...todos].sort((a, b) => {
    let aValue: string | number | boolean | Date
    let bValue: string | number | boolean | Date

    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'completed':
        aValue = a.completed
        bValue = b.completed
        break
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
        break
      case 'updatedAt':
        aValue = new Date(a.updatedAt).getTime()
        bValue = new Date(b.updatedAt).getTime()
        break
      default:
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
    }

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Todoグループ化ヘルパー
 * 完了状態でTodoをグループ化
 */
export function groupTodosByStatus(todos: Todo[]): {
  completed: Todo[]
  pending: Todo[]
} {
  return {
    completed: todos.filter((todo) => todo.completed),
    pending: todos.filter((todo) => !todo.completed),
  }
}

/**
 * Todoバリデーションヘルパー
 * フロントエンド用の簡単なバリデーション
 */
export function validateTodoInput(input: {
  title?: string
  description?: string
}): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!input.title || input.title.trim().length === 0) {
    errors.push('タイトルは必須です')
  } else if (input.title.length > 100) {
    errors.push('タイトルは100文字以内で入力してください')
  }

  if (input.description && input.description.length > 500) {
    errors.push('説明は500文字以内で入力してください')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
