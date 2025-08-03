import { Suspense } from 'react'
import {
  TodoPageLoading,
  TodoPageServer,
} from '@/features/todos/components/TodoPageServer'

/**
 * Main page component - Server Component for better performance
 *
 * This is now a pure composition component that:
 * - Runs on the server for better SEO and performance
 * - Uses Suspense for proper loading states
 * - Delegates data fetching to specialized server components
 * - Provides error boundaries for better UX
 */
export default function HomePage() {
  return (
    <Suspense fallback={<TodoPageLoading />}>
      <TodoPageServer />
    </Suspense>
  )
}

/**
 * Error boundary for the home page
 * Provides graceful error handling at the page level
 */
export function generateMetadata() {
  return {
    title: 'Todo アプリ - oRPC + Next.js',
    description:
      'Type-safe Todo application built with oRPC, Next.js App Router, and PostgreSQL',
    keywords: ['todo', 'oRPC', 'Next.js', 'TypeScript', 'PostgreSQL'],
  }
}
