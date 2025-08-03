import { headers } from 'next/headers'
import type { Todo } from '@/features/todos/types/todo'

/**
 * Server-side todo service for data fetching
 * Uses Next.js server-side fetch with proper caching
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

/**
 * Get base URL for server-side requests
 * In production, this would be the actual domain
 */
function getServerApiUrl(path: string): string {
  // For server-side requests, we need to use absolute URLs
  return `${API_BASE_URL}/api${path}`
}

/**
 * Create server-side fetch headers
 */
async function createServerHeaders(): Promise<HeadersInit> {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')
  return {
    'Content-Type': 'application/json',
    // Forward any authentication headers if present
    ...(authHeader && {
      authorization: authHeader,
    }),
  }
}

/**
 * Fetch all todos from the server
 * This runs on the server and can be cached by Next.js
 */
export async function fetchTodos(): Promise<Todo[]> {
  try {
    const response = await fetch(getServerApiUrl('/todos/list'), {
      method: 'POST',
      headers: await createServerHeaders(),
      body: JSON.stringify({}),
      // Enable Next.js caching for better performance
      next: {
        revalidate: 60, // Revalidate every 60 seconds
        tags: ['todos'], // Allow tag-based revalidation
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch todos: ${response.status}`)
    }

    const todos = await response.json()

    // Validate the response data
    if (!Array.isArray(todos)) {
      throw new Error('Invalid response format: expected array')
    }

    return todos
  } catch (error) {
    console.error('Error fetching todos:', error)

    // Return empty array instead of throwing to prevent page crashes
    // In a production app, you might want to implement retry logic or fallback data
    return []
  }
}

/**
 * Get todo statistics
 * Derived data computed on the server for better performance
 */
export async function getTodoStats(todos: Todo[]): Promise<{
  total: number
  completed: number
  pending: number
  completionRate: number
}> {
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
 * Filter todos based on criteria
 * Server-side filtering for better performance with large datasets
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
