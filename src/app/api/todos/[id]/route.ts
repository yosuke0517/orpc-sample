import { type NextRequest, NextResponse } from 'next/server'
import { todoStore } from '@/features/todos/api/store'
import { UpdateTodoSchema } from '@/features/todos/types/todo'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const todo = await todoStore.getById(id)
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }
    return NextResponse.json(todo)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch todo' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = UpdateTodoSchema.parse(body)
    const todo = await todoStore.update(id, validatedData)
    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }
    return NextResponse.json(todo)
  } catch {
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const success = await todoStore.delete(id)
    if (!success) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    )
  }
}
