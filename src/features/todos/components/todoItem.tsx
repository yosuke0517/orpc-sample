'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Todo } from '../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => Promise<void>
  onUpdate: (
    id: string,
    data: { title: string; description?: string }
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  disabled?: boolean
}

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  disabled = false,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)
  const [description, setDescription] = useState(todo.description || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      await onToggle(todo.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!title.trim()) return

    setIsLoading(true)
    try {
      await onUpdate(todo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
      })
      setIsEditing(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setTitle(todo.title)
    setDescription(todo.description || '')
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('このTodoを削除しますか？')) return

    setIsLoading(true)
    try {
      await onDelete(todo.id)
    } finally {
      setIsLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル"
          disabled={isLoading || disabled}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明（任意）"
          disabled={isLoading || disabled}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleUpdate}
            isLoading={isLoading}
            disabled={!title.trim() || disabled}
          >
            保存
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading || disabled}
          >
            キャンセル
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm">
      <Checkbox
        checked={todo.completed}
        onChange={handleToggle}
        disabled={isLoading || disabled}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}
        >
          {todo.title}
        </h3>
        {todo.description && (
          <p
            className={`mt-1 text-sm ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}
          >
            {todo.description}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          作成日: {new Date(todo.createdAt).toLocaleDateString('ja-JP')}
        </p>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          disabled={isLoading || disabled}
        >
          編集
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          disabled={isLoading || disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          削除
        </Button>
      </div>
    </div>
  )
}
