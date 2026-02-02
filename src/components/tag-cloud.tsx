'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Hash } from 'lucide-react'

interface TagStats {
  tag: string
  count: number
}

interface TagCloudProps {
  onSelectTag?: (tag: string) => void
  maxTags?: number
  className?: string
}

export function TagCloud({ onSelectTag, maxTags = 30, className = '' }: TagCloudProps) {
  const [tags, setTags] = useState<TagStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch(`/api/tags?limit=${maxTags}`)
        const data = await response.json()
        if (data.success) {
          setTags(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [maxTags])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="h-4 w-4" />
            标签云
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tags.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Hash className="h-4 w-4" />
            标签云
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 dark:text-slate-400">暂无标签</p>
        </CardContent>
      </Card>
    )
  }

  // 计算字体大小范围
  const maxCount = Math.max(...tags.map(t => t.count))
  const minCount = Math.min(...tags.map(t => t.count))

  const getFontSize = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1)
    return 0.75 + ratio * 0.75 // 0.75rem to 1.5rem
  }

  const getOpacity = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount || 1)
    return 0.6 + ratio * 0.4 // 0.6 to 1.0
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Hash className="h-4 w-4" />
          标签云
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-950/50 hover:ring-2 hover:ring-indigo-500 transition-all`}
              style={{
                fontSize: `${getFontSize(count)}rem`,
                opacity: getOpacity(count)
              }}
              onClick={() => onSelectTag?.(tag)}
            >
              {tag}
              <span className="ml-1 text-xs opacity-70">({count})</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
