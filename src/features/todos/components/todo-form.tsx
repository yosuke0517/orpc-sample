'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CreateTodoInput } from '../types/todo'

interface TodoFormProps {
  onSubmit: (data: CreateTodoInput) => Promise<void>
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    const newErrors: Record<string, string> = {}
    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です'
    } else if (title.trim().length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください'
    }

    if (description.trim().length > 500) {
      newErrors.description = '説明は500文字以内で入力してください'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      })

      // フォームリセット
      setTitle('')
      setDescription('')
      setErrors({})
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>新しいTodoを追加</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトル"
              error={errors.title}
              disabled={isLoading}
            />
          </div>
          <div>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="説明（任意）"
              error={errors.description}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={!title.trim()}
            className="w-full"
          >
            追加
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
