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
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Todoがありません
        </h3>
        <p className="text-gray-500">新しいTodoを追加して始めましょう！</p>
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
