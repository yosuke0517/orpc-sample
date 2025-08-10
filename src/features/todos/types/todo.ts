import { z } from 'zod'
import type { Todo as DrizzleTodo, NewTodo as DrizzleNewTodo, UpdateTodo as DrizzleUpdateTodo } from '@/db/schema'
import { insertTodoSchema, selectTodoSchema } from '@/db/schema'

// Drizzleの型定義をre-export
export type Todo = DrizzleTodo
export type NewTodo = DrizzleNewTodo
export type UpdateTodo = DrizzleUpdateTodo

// スキーマのエクスポート
export const CreateTodoSchema = insertTodoSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})
export const TodoSchema = selectTodoSchema

// 後方互換性のための型エイリアス
export type CreateTodoInput = Omit<NewTodo, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateTodoInput = Partial<Omit<NewTodo, 'id' | 'createdAt' | 'updatedAt'>>

// oRPC用の更新スキーマ
export const UpdateTodoSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  completed: z.boolean().optional(),
})

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
