import { z } from 'zod'

// Todo型のスキーマ定義
export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  completed: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Todo作成時の入力スキーマ
export const CreateTodoSchema = TodoSchema.pick({
  title: true,
  description: true,
}).strict()

// Todo更新時の入力スキーマ
export const UpdateTodoSchema = TodoSchema.pick({
  title: true,
  description: true,
  completed: true,
})
  .partial()
  .strict()

// 型定義のエクスポート
export type Todo = z.infer<typeof TodoSchema>
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>

// フィルター用のスキーマ
export const TodoFilterSchema = z.object({
  completed: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export type TodoFilter = z.infer<typeof TodoFilterSchema>

// ページネーション用のスキーマ
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

export type Pagination = z.infer<typeof PaginationSchema>

// APIレスポンス用のスキーマ
export const TodoListResponseSchema = z.object({
  todos: z.array(TodoSchema),
  totalCount: z.number(),
  page: z.number(),
  totalPages: z.number(),
})

export type TodoListResponse = z.infer<typeof TodoListResponseSchema>
