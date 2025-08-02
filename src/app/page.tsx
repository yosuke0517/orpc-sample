'use client'

import { useCallback, useEffect, useState } from 'react'
import { TodoFilters } from '@/features/todos/components/todoFilters'
import { TodoForm } from '@/features/todos/components/todoForm'
import { TodoList } from '@/features/todos/components/todoList'
import type {
  CreateTodoInput,
  Todo,
  TodoFilter,
  UpdateTodoInput,
} from '@/features/todos/types/todo'

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<TodoFilter>({})
  const [isLoading, setIsLoading] = useState(true)

  // Todoを取得する関数（oRPC経由）
  const fetchTodos = useCallback(async () => {
    try {
      const response = await fetch('/api/orpc/todos/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Failed to fetch todos:', error)
      // フォールバック: 従来のAPIを使用
      const response = await fetch('/api/todos')
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 初回読み込み
  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  console.log(todos)

  // フィルター済みのTodoを取得
  const filteredTodos = todos.filter((todo) => {
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

  // Todo作成ハンドラー（oRPC経由）
  const handleCreateTodo = async (data: CreateTodoInput) => {
    try {
      const response = await fetch('/api/orpc/todos/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        const newTodo = await response.json()
        setTodos(prev => [newTodo, ...prev])
      }
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  // Todo更新ハンドラー（oRPC経由）
  const handleUpdateTodo = async (id: string, data: UpdateTodoInput) => {
    try {
      const response = await fetch('/api/orpc/todos/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, data }),
      })
      
      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(prev => prev.map(todo => 
          todo.id === id ? updatedTodo : todo
        ))
      }
    } catch (error) {
      console.error('Failed to update todo:', error)
    }
  }

  // Todo完了切り替えハンドラー
  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    
    await handleUpdateTodo(id, { completed: !todo.completed })
  }

  // Todo削除ハンドラー（oRPC経由）
  const handleDeleteTodo = async (id: string) => {
    try {
      const response = await fetch('/api/orpc/todos/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })
      
      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const totalCount = todos.length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todo アプリ</h1>
          <p className="text-gray-600">
            完了: {completedCount} / 全体: {totalCount}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            🚀 oRPC + PostgreSQL で動作中
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <TodoForm onSubmit={handleCreateTodo} />
              <TodoFilters filter={filter} onFilterChange={setFilter} />
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <TodoList
              todos={filteredTodos}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}