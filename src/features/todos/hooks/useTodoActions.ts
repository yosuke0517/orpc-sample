'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import { calculateExtendedTodoStats } from '@/features/todos/helpers/todoHelpers'
import type {
  CreateTodoInput,
  UpdateTodoInput,
} from '@/features/todos/types/todo'

/**
 * Custom hook for todo CRUD operations
 * Provides reusable logic for client-side todo actions with server synchronization
 */
export function useTodoActions() {
  const router = useRouter()

  /**
   * Create a new todo
   * Uses server action pattern for better performance and reliability
   */
  const createTodo = useCallback(
    async (data: CreateTodoInput): Promise<void> => {
      const response = await fetch('/api/todos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to create todo: ${response.status}`
        )
      }

      // Refresh the page to get updated data from server
      // This ensures data consistency and leverages Next.js caching
      router.refresh()
    },
    [router]
  )

  /**
   * Update an existing todo
   * Supports partial updates for better performance
   */
  const updateTodo = useCallback(
    async (id: string, data: UpdateTodoInput): Promise<void> => {
      const response = await fetch('/api/todos/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, data }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to update todo: ${response.status}`
        )
      }

      router.refresh()
    },
    [router]
  )

  /**
   * Delete a todo
   * Includes confirmation for better UX
   */
  const deleteTodo = useCallback(
    async (id: string): Promise<void> => {
      const response = await fetch('/api/todos/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || `Failed to delete todo: ${response.status}`
        )
      }

      router.refresh()
    },
    [router]
  )

  /**
   * Toggle todo completion status
   * Convenience method for common use case
   */
  const toggleTodo = useCallback(
    async (id: string, currentStatus: boolean): Promise<void> => {
      await updateTodo(id, { completed: !currentStatus })
    },
    [updateTodo]
  )

  /**
   * Batch operations for multiple todos
   * Useful for bulk actions like "mark all as complete"
   */
  const batchUpdateTodos = useCallback(
    async (
      updates: Array<{ id: string; data: UpdateTodoInput }>
    ): Promise<void> => {
      // Execute all updates in parallel for better performance
      const promises = updates.map(({ id, data }) => updateTodo(id, data))

      try {
        await Promise.all(promises)
      } catch (error) {
        // If any update fails, refresh to ensure UI consistency
        router.refresh()
        throw error
      }
    },
    [updateTodo, router]
  )

  /**
   * Delete multiple todos
   * Useful for bulk deletion operations
   */
  const batchDeleteTodos = useCallback(
    async (ids: string[]): Promise<void> => {
      const promises = ids.map((id) => deleteTodo(id))

      try {
        await Promise.all(promises)
      } catch (error) {
        router.refresh()
        throw error
      }
    },
    [deleteTodo, router]
  )

  return {
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    batchUpdateTodos,
    batchDeleteTodos,
  }
}

/**
 * Hook for todo statistics and derived data
 * Provides computed values based on todo list
 */
export function useTodoStats(todos: Array<{ completed: boolean }>) {
  return calculateExtendedTodoStats(todos)
}
