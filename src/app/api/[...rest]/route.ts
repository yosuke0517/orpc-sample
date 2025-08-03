import { OpenAPIHandler } from '@orpc/openapi/fetch'
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins'
import { onError } from '@orpc/server'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { router } from '@/server/router'

const openAPIHandler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
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
      docsPath: '/doc',
      specPath: '/doc/spec.json',
    }),
  ],
})

async function handleRequest(request: Request) {
  const { response } = await openAPIHandler.handle(request, {
    prefix: '/api',
  })

  return response ?? new Response('Not found', { status: 404 })
}

export const HEAD = handleRequest
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
