'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tag, X, Search } from 'lucide-react'

interface TagFilterProps {
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  className?: string
}

export function TagFilter({ selectedTags, onTagsChange, className = '' }: TagFilterProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags?limit=100')
        const data = await response.json()
        if (data.success) {
          setAvailableTags(data.data.map((t: { tag: string }) => t.tag))
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(search.toLowerCase()) &&
    !selectedTags.includes(tag)
  )

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag])
    }
  }

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag))
  }

  return (
    <div className={className}>
      {/* 已选标签 */}
      {selectedTags.length > 0 && (
        <Card className="mb-3 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2">
              {selectedTags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 pr-1"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => onTagsChange([])}
                >
                  清空
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 标签选择器 */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="搜索标签..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* 可选标签 */}
            {loading ? (
              <div className="flex flex-wrap gap-2 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                ))}
              </div>
            ) : filteredTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {filteredTags.slice(0, 20).map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => handleAddTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {filteredTags.length > 20 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
                    还有 {filteredTags.length - 20} 个标签...
                  </span>
                )}
              </div>
            ) : search ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                没有找到匹配的标签
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2">
                暂无可用标签
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
