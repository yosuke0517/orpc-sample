'use client'

import type { Todo, UpdateTodoInput } from '../types/todo'
import { TodoItem } from './todoItem'

interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string) => Promise<void>
  onUpdate: (id: string, data: UpdateTodoInput) => Promise<void>
  onDelete: (id: string) => Promise<void>
  disabled?: boolean
}

export function TodoList({
  todos,
  onToggle,
  onUpdate,
  onDelete,
  disabled = false,
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Todoがありません</p>
        <p className="text-sm text-gray-400 mt-1">
          上のフォームから新しいTodoを追加してください
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
