import { createRouterClient } from '@orpc/server'
import { type NextRequest, NextResponse } from 'next/server'
import { CreateTodoSchema } from '@/features/todos/types/todo'
import { router } from '@/server/router'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input using Zod schema
    const validatedData = CreateTodoSchema.parse(body)

    // Create todo using oRPC server client
    const orpcClient = createRouterClient(router)
    const todo = await orpcClient.todos.create(validatedData)

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error creating todo:', error)

    return NextResponse.json(
      {
        message: 'Failed to create todo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
