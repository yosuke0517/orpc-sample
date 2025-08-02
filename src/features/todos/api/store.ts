import { db } from '@/lib/database'
import type { CreateTodoInput, Todo, UpdateTodoInput } from '../types/todo'

// PostgreSQL用のTodoストア
class TodoStore {
  async getAll(): Promise<Todo[]> {
    const result = await db.query(`
      SELECT id, title, description, completed, created_at, updated_at 
      FROM todos 
      ORDER BY created_at DESC
    `)
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  async getById(id: string): Promise<Todo | null> {
    const result = await db.query(`
      SELECT id, title, description, completed, created_at, updated_at 
      FROM todos 
      WHERE id = $1
    `, [id])
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const result = await db.query(`
      INSERT INTO todos (title, description) 
      VALUES ($1, $2) 
      RETURNING id, title, description, completed, created_at, updated_at
    `, [input.title, input.description || null])
    
    const row = result.rows[0]
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    const updates: string[] = []
    const values: (string | boolean)[] = []
    let paramCount = 1

    if (input.title !== undefined) {
      updates.push(`title = $${paramCount}`)
      values.push(input.title)
      paramCount++
    }

    if (input.description !== undefined) {
      updates.push(`description = $${paramCount}`)
      values.push(input.description || '')
      paramCount++
    }

    if (input.completed !== undefined) {
      updates.push(`completed = $${paramCount}`)
      values.push(input.completed)
      paramCount++
    }

    if (updates.length === 0) {
      return await this.getById(id)
    }

    values.push(id)
    
    const result = await db.query(`
      UPDATE todos 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, title, description, completed, created_at, updated_at
    `, values)
    
    if (result.rows.length === 0) return null
    
    const row = result.rows[0]
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      completed: row.completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.query('DELETE FROM todos WHERE id = $1', [id])
    return result.rowCount !== null && result.rowCount > 0
  }

  async deleteAll(): Promise<void> {
    await db.query('DELETE FROM todos')
  }
}

// シングルトンインスタンス
export const todoStore = new TodoStore()