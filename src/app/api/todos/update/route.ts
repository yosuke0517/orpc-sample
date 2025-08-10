import { createRouterClient } from '@orpc/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UpdateTodoSchema } from '@/features/todos/types/todo'
import { router } from '@/server/router'

const UpdateRequestSchema = z.object({
  id: z.string().min(1),
  data: UpdateTodoSchema,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { id, data } = UpdateRequestSchema.parse(body)

    // Update todo using oRPC server client
    const orpcClient = createRouterClient(router)
    const todo = await orpcClient.todos.update({ id, data })

    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error updating todo:', error)

    return NextResponse.json(
      {
        message: 'Failed to update todo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
