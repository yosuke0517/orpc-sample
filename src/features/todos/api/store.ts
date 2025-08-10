import { eq, desc } from 'drizzle-orm'
import { db } from '@/db'
import { todos, type Todo, type NewTodo, type UpdateTodo } from '@/db/schema'

// Drizzle ORM を使用したTodoストア
class TodoStore {
  async getAll(): Promise<Todo[]> {
    // Sort by createdAt descending (newest first)
    return await db.select().from(todos).orderBy(desc(todos.createdAt))
  }

  async getById(id: string): Promise<Todo | null> {
    const result = await db.select().from(todos).where(eq(todos.id, id))
    return result[0] || null
  }

  async create(input: Omit<NewTodo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    const result = await db.insert(todos).values(input).returning()
    return result[0]
  }

  async update(id: string, input: UpdateTodo): Promise<Todo | null> {
    const result = await db
      .update(todos)
      .set(input)
      .where(eq(todos.id, id))
      .returning()
    
    return result[0] || null
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(todos).where(eq(todos.id, id)).returning()
    return result.length > 0
  }

  async deleteAll(): Promise<void> {
    await db.delete(todos)
  }
}

// シングルトンインスタンス
export const todoStore = new TodoStore()
