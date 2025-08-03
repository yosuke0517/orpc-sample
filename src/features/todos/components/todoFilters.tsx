'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { TodoFilter } from '../types/todo'

interface TodoFiltersProps {
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  disabled?: boolean
}

export function TodoFilters({
  filter,
  onFilterChange,
  disabled = false,
}: TodoFiltersProps) {
  const handleCompletedFilter = (completed?: boolean) => {
    onFilterChange({ ...filter, completed })
  }

  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filter, search: search || undefined })
  }

  const completedCount =
    filter.completed === true
      ? '完了'
      : filter.completed === false
        ? '未完了'
        : 'すべて'

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label
          htmlFor="search-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          検索
        </label>
        <Input
          id="search-input"
          value={filter.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="タイトルまたは説明で検索..."
          disabled={disabled}
        />
      </div>

      <div>
        <div className="block text-sm font-medium text-gray-700 mb-2">
          ステータス: {completedCount}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter.completed === undefined ? 'primary' : 'secondary'}
            onClick={() => handleCompletedFilter(undefined)}
            disabled={disabled}
          >
            すべて
          </Button>
          <Button
            size="sm"
            variant={filter.completed === false ? 'primary' : 'secondary'}
            onClick={() => handleCompletedFilter(false)}
            disabled={disabled}
          >
            未完了
          </Button>
          <Button
            size="sm"
            variant={filter.completed === true ? 'primary' : 'secondary'}
            onClick={() => handleCompletedFilter(true)}
            disabled={disabled}
          >
            完了
          </Button>
        </div>
      </div>
    </div>
  )
}
