import { Suspense } from 'react'
import { fetchTodos, getTodoStats } from '@/features/todos/services/todoService'
import { TodoPageClient } from './TodoPageClient'
import { TodoSkeleton } from './TodoSkeleton'

/**
 * Server Component for Todo Page
 * Handles server-side data fetching and passes data to client components
 */

/**
 * Main server component that fetches initial data
 * This component runs on the server and provides SSR benefits
 */
export async function TodoPageServer() {
  // Fetch todos on the server for better performance and SEO
  const todos = await fetchTodos()
  const stats = await getTodoStats(todos)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todo アプリ</h1>
          <p className="text-gray-600">
            完了: {stats.completed} / 全体: {stats.total}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            🚀 oRPC + PostgreSQL で動作中 (SSR対応)
          </p>
          {stats.total > 0 && (
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2 w-48">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                完了率: {stats.completionRate}%
              </p>
            </div>
          )}
        </header>

        {/* 
          Pass server-fetched data to client component
          This allows the client component to focus on interactivity
          while benefiting from server-side data fetching
        */}
        <Suspense fallback={<TodoSkeleton />}>
          <TodoPageClient initialTodos={todos} />
        </Suspense>
      </div>
    </div>
  )
}

/**
 * Error boundary component for todo page
 * Provides graceful error handling for the entire page
 */
export function TodoPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          エラーが発生しました
        </h2>
        <p className="text-gray-600 mb-4">
          Todoの読み込み中に問題が発生しました。
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={reset}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/'
            }}
            className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              開発者向け詳細
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

/**
 * Loading component for initial page load
 * Used when the entire page is loading for the first time
 */
export function TodoPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-56"></div>
          </div>
        </header>
        <TodoSkeleton />
      </div>
    </div>
  )
}
