'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Home, Trash2, Eye, Loader2 } from 'lucide-react'
import { HistoryItem } from '@/types/api'

export default function HistoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  const fetchHistory = async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/history?page=${p}&limit=${limit}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data.items)
        setTotal(data.data.total)
      } else {
        toast.error(data.error || '加载失败')
      }
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(page)
  }, [page])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('删除成功')
        fetchHistory(page)
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch {
      toast.error('删除失败')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
          <h1 className="text-xl font-bold">历史记录</h1>
          <div className="w-24" />
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>暂无历史记录</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/')}>
                <Home className="mr-2 h-4 w-4" />
                去首页生成摘要
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{item.articleTitle}</CardTitle>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/result?id=${item.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {item.articleAuthor && <span>作者: {item.articleAuthor}</span>}
                    <span>AI: {item.provider.toUpperCase()}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  上一页
                </Button>
                <span className="flex items-center px-4">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  下一页
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
