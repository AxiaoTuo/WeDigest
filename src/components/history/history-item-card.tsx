'use client'

import { memo, useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { HistoryItem } from '@/types/api'
import { Star, Trash2, Eye, Sparkles, Calendar, FileText } from 'lucide-react'

interface HistoryItemCardProps {
  item: HistoryItem
  isBatchMode: boolean
  isSelected: boolean
  onSelect: (id: string) => void
  onView: (id: string) => void
  onFavorite: (id: string, isFavorite: boolean) => void
  onDelete: (id: string) => void
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
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
  const formattedDate = useMemo(() => formatDate(item.createdAt), [item.createdAt])

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
      className={`border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer group bg-white/90 dark:bg-slate-800/90 backdrop-blur-md ${
        isBatchMode ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-background' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
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
              <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                {item.articleTitle}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {item.articleAuthor && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    <span className="truncate max-w-24">{item.articleAuthor}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {item.provider.toUpperCase()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2">
                {item.keywords.slice(0, 3).map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors duration-200">
                    {keyword}
                  </Badge>
                ))}
                {item.keywords.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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
              className={`h-8 w-8 p-0 transition-colors duration-200 ${item.isFavorite ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30'}`}
            >
              <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {!isBatchMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(item.id)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors duration-200"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
})
