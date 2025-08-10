import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// Todosテーブル定義
export const todos = sqliteTable('todos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title').notNull(),
  description: text('description'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
})

// Zod スキーマの生成
export const insertTodoSchema = createInsertSchema(todos, {
  title: z.string().min(1, 'タイトルは必須です').max(255, 'タイトルが長すぎます'),
  description: z.string().max(1000, '説明が長すぎます').optional(),
})

export const selectTodoSchema = createSelectSchema(todos)

// 型定義
export type Todo = typeof todos.$inferSelect
export type NewTodo = typeof todos.$inferInsert
export type UpdateTodo = Partial<Omit<NewTodo, 'id' | 'createdAt' | 'updatedAt'>>