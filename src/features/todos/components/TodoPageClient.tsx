'use client'

import { useOptimistic, useState, useTransition } from 'react'
import { TodoFilters } from '@/features/todos/components/todoFilters'
import { TodoForm } from '@/features/todos/components/todoForm'
import { TodoList } from '@/features/todos/components/todoList'
import { useTodoActions } from '@/features/todos/hooks/useTodoActions'
import type {
  CreateTodoInput,
  Todo,
  TodoFilter,
  UpdateTodoInput,
} from '@/features/todos/types/todo'

type TodoPageClientProps = {
  initialTodos: Todo[]
}

/**
 * Client Component for Todo Page
 * Handles user interactions, optimistic updates, and client-side state
 */
export function TodoPageClient({ initialTodos }: TodoPageClientProps) {
  // Client-side state management
  const [filter, setFilter] = useState<TodoFilter>({})
  const [isPending, startTransition] = useTransition()

  // Optimistic updates for better UX
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    initialTodos,
    (
      state: Todo[],
      action: { type: string; todo?: Todo; id?: string; data?: Partial<Todo> }
    ) => {
      switch (action.type) {
        case 'add':
          return action.todo ? [action.todo, ...state] : state
        case 'update':
          return action.id && action.data
            ? state.map((todo) =>
                todo.id === action.id ? { ...todo, ...action.data } : todo
              )
            : state
        case 'delete':
          return action.id
            ? state.filter((todo) => todo.id !== action.id)
            : state
        default:
          return state
      }
    }
  )

  // Custom hooks for CRUD operations
  const { createTodo, updateTodo, deleteTodo } = useTodoActions()

  // Filter todos based on current filter state
  const filteredTodos = optimisticTodos.filter((todo) => {
    if (filter.completed !== undefined && todo.completed !== filter.completed) {
      return false
    }
    if (filter.search) {
      const search = filter.search.toLowerCase()
      return (
        todo.title.toLowerCase().includes(search) ||
        todo.description?.toLowerCase().includes(search)
      )
    }
    return true
  })

  // Event handlers with optimistic updates
  const handleCreateTodo = async (data: CreateTodoInput) => {
    // Perform optimistic update and actual creation in transition
    startTransition(async () => {
      // Create optimistic todo for immediate UI feedback
      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`, // Temporary ID
        title: data.title,
        description: data.description,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add optimistic update
      addOptimisticTodo({ type: 'add', todo: optimisticTodo })

      try {
        await createTodo(data)
        // The page will be refreshed with updated data from server
      } catch (error) {
        console.error('Failed to create todo:', error)
        // TODO: Show error toast/notification
        // For now, the page refresh will remove the optimistic update
      }
    })
  }

  const handleUpdateTodo = async (id: string, data: UpdateTodoInput) => {
    startTransition(async () => {
      // Add optimistic update
      addOptimisticTodo({ type: 'update', id, data })

      try {
        await updateTodo(id, data)
      } catch (error) {
        console.error('Failed to update todo:', error)
        // TODO: Show error toast/notification
      }
    })
  }

  const handleToggleTodo = async (id: string) => {
    const todo = optimisticTodos.find((t) => t.id === id)
    if (!todo) return

    await handleUpdateTodo(id, { completed: !todo.completed })
  }

  const handleDeleteTodo = async (id: string) => {
    startTransition(async () => {
      // Add optimistic update
      addOptimisticTodo({ type: 'delete', id })

      try {
        await deleteTodo(id)
      } catch (error) {
        console.error('Failed to delete todo:', error)
        // TODO: Show error toast/notification
      }
    })
  }

  return (
    <>
      {/* Show loading indicator during transitions */}
      {isPending && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-md shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-sm">保存中...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <TodoForm onSubmit={handleCreateTodo} disabled={isPending} />
            <TodoFilters
              filter={filter}
              onFilterChange={setFilter}
              disabled={isPending}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <TodoList
            todos={filteredTodos}
            onToggle={handleToggleTodo}
            onUpdate={handleUpdateTodo}
            onDelete={handleDeleteTodo}
            disabled={isPending}
          />
        </div>
      </div>
    </>
  )
}
