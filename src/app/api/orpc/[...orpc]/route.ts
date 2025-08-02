import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { todoRouter } from '@/features/todos/api/router'

const handler = new OpenAPIHandler(todoRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: 'oRPC Todo API',
          version: '1.0.0',
          description: 'Type-safe Todo CRUD API built with oRPC',
        },
      },
    }),
  ],
})

async function handleRequest(request: Request) {
  const { response } = await handler.handle(request, { prefix: '/api/orpc' })
  return response ?? new Response('Not found', { status: 404 })
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest