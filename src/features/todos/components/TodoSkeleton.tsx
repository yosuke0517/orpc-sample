/**
 * Loading skeleton components for Todo page
 * Provides better UX with skeleton loading states using Suspense
 */

/**
 * Main todo page skeleton
 * Used as fallback for the entire todo page when loading
 */
export function TodoSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
      <div className="lg:col-span-1">
        <div className="space-y-6">
          <TodoFormSkeleton />
          <TodoFiltersSkeleton />
        </div>
      </div>

      <div className="lg:col-span-2">
        <TodoListSkeleton />
      </div>
    </div>
  )
}

/**
 * Todo form skeleton
 * Shows loading state for the create todo form
 */
export function TodoFormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>

      <div className="space-y-4">
        {/* Title input skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>

        {/* Description textarea skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-20 bg-gray-100 rounded w-full"></div>
        </div>

        {/* Submit button skeleton */}
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  )
}

/**
 * Todo filters skeleton
 * Shows loading state for the filter controls
 */
export function TodoFiltersSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-6 bg-gray-300 rounded w-24 mb-4"></div>

      <div className="space-y-4">
        {/* Search input skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
          <div className="h-10 bg-gray-100 rounded w-full"></div>
        </div>

        {/* Status filter skeleton */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-100 rounded w-16"></div>
            <div className="h-8 bg-gray-100 rounded w-16"></div>
            <div className="h-8 bg-gray-100 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Todo list skeleton
 * Shows loading state for the todo list
 */
export function TodoListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-24"></div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <TodoItemSkeleton key="skeleton-item-1" />
          <TodoItemSkeleton key="skeleton-item-2" />
          <TodoItemSkeleton key="skeleton-item-3" />
        </div>
      </div>
    </div>
  )
}

/**
 * Individual todo item skeleton
 * Shows loading state for each todo item
 */
export function TodoItemSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      {/* Checkbox skeleton */}
      <div className="w-5 h-5 bg-gray-200 rounded border-2 border-gray-300 mt-0.5"></div>

      <div className="flex-1 space-y-2">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>

        {/* Description skeleton */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-100 rounded w-full"></div>
          <div className="h-4 bg-gray-100 rounded w-2/3"></div>
        </div>

        {/* Date skeleton */}
        <div className="h-3 bg-gray-100 rounded w-32"></div>
      </div>

      {/* Actions skeleton */}
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}

/**
 * Compact loading spinner
 * Used for inline loading states during operations
 */
export function TodoLoadingSpinner({
  size = 'sm',
}: {
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
    ></div>
  )
}

/**
 * Empty state component
 * Shows when there are no todos to display
 */
export function TodoEmptyState({
  title = 'まだTodoがありません',
  description = '新しいTodoを作成して始めましょう',
  showCreatePrompt = true,
}: {
  title?: string
  description?: string
  showCreatePrompt?: boolean
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {showCreatePrompt && (
        <p className="text-sm text-blue-600">
          左側のフォームから新しいTodoを追加できます
        </p>
      )}
    </div>
  )
}

/**
 * Error state component
 * Shows when there's an error loading todos
 */
export function TodoErrorState({
  error,
  onRetry,
}: {
  error: Error
  onRetry?: () => void
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        エラーが発生しました
      </h3>
      <p className="text-gray-500 mb-4">
        {error.message || 'Todoの読み込み中に問題が発生しました'}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          再試行
        </button>
      )}
    </div>
  )
}
