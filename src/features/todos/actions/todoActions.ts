'use server'

import { createRouterClient } from '@orpc/server'
import type { CreateTodoInput } from '@/features/todos/types/todo'
import { router } from '@/server/router'

/**
 * Server action for creating a todo
 * Extracted from client component to comply with Next.js server action rules
 */
export async function createTodoAction(data: CreateTodoInput) {
  const orpcClient = createRouterClient(router)
  return await orpcClient.todos.create({
    title: data.title,
    description: data.description || undefined, // Convert null to undefined
    completed: data.completed || false,
  })
}
