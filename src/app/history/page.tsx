'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BookOpen, Home, Trash2, Eye, Loader2, Sparkles, Clock, FileText } from 'lucide-react'
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50">
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">WeDigest</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 hover:text-slate-900">
              <FileText className="mr-2 h-4 w-4" />
              开始使用
            </Button>
            <Button variant="ghost" onClick={() => router.push('/settings')} className="text-slate-700 hover:text-slate-900">
              设置
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">历史记录</h2>
                <p className="text-slate-600">查看您的所有深度研报</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>共 {total} 条记录</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-slate-600">加载中...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <Card className="max-w-lg mx-auto border-2 border-dashed border-slate-300">
            <CardContent className="py-16 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无历史记录</h3>
              <p className="text-slate-600 mb-6">开始生成您的第一个深度研报吧</p>
              <Button 
                onClick={() => router.push('/app')} 
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Home className="mr-2 h-4 w-4" />
                开始使用
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {items.map((item) => (
                <Card key={item.id} className="border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                          {item.articleTitle}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                          {item.articleAuthor && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {item.articleAuthor}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            {item.provider.toUpperCase()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300"
                          onClick={() => router.push(`/result?id=${item.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-300"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {item.keywords.slice(0, 5).map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                          {keyword}
                        </Badge>
                      ))}
                      {item.keywords.length > 5 && (
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                          +{item.keywords.length - 5}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-24"
                >
                  上一页
                </Button>
                <div className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-100">
                  <span className="text-sm text-slate-600">第</span>
                  <span className="text-lg font-semibold text-slate-900">{page}</span>
                  <span className="text-sm text-slate-600">/ {totalPages}</span>
                  <span className="text-sm text-slate-600">页</span>
                </div>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-24"
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
