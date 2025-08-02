import { type NextRequest, NextResponse } from 'next/server'
import { todoStore } from '@/features/todos/api/store'
import { CreateTodoSchema } from '@/features/todos/types/todo'

export async function GET() {
  try {
    const todos = await todoStore.getAll()
    return NextResponse.json(todos)
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateTodoSchema.parse(body)
    const todo = await todoStore.create(validatedData)
    return NextResponse.json(todo, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 400 }
    )
  }
}
