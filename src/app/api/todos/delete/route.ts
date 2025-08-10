import { createRouterClient } from '@orpc/server'
import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { router } from '@/server/router'

const DeleteRequestSchema = z.object({
  id: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const { id } = DeleteRequestSchema.parse(body)

    // Delete todo using oRPC server client
    const orpcClient = createRouterClient(router)
    const result = await orpcClient.todos.delete({ id })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error deleting todo:', error)

    return NextResponse.json(
      {
        message: 'Failed to delete todo',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
