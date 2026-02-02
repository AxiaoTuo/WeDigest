'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { HistoryItem } from '@/types/api'
import { Star, Trash2, Eye, Sparkles, Calendar } from 'lucide-react'

interface HistoryItemCardProps {
  item: HistoryItem
  isBatchMode: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (id: string) => void
  onFavorite: (id: string, isFavorite: boolean) => void
  onDelete: (id: string) => void
}

export const HistoryItemCard = memo<HistoryItemCardProps>(function HistoryItemCard({
  item,
  isBatchMode,
  isSelected,
  onSelect,
  onView,
  onFavorite,
  onDelete
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const diff = Date.now() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavorite(item.id, !item.isFavorite)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(item.id)
  }

  const handleCardClick = () => {
    if (!isBatchMode) {
      onView(item.id)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onSelect(item.id)
    }
  }

  return (
    <Card
      className={`border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm ${
        isBatchMode ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* 多选 checkbox */}
            {isBatchMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleCheckboxChange}
                className="mt-1"
              />
            )}

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                {item.articleTitle}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600 dark:text-slate-400">
                {item.articleAuthor && <span>作者: {item.articleAuthor}</span>}
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {item.provider.toUpperCase()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {item.keywords.slice(0, 3).map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">
                    {keyword}
                  </Badge>
                ))}
                {item.keywords.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{item.keywords.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteClick}
              className={`h-8 w-8 p-0 ${item.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {!isBatchMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(item.id)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
          {item.summary}
        </p>
      </CardContent>
    </Card>
  )
})
