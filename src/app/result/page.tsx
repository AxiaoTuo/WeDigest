'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Download, Copy, Home, Loader2 } from 'lucide-react'
import { HistoryDetail } from '@/types/api'

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  const [detail, setDetail] = useState<HistoryDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) {
      router.push('/')
      return
    }

    fetch(`/api/history/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDetail(data.data)
        } else {
          toast.error(data.error || '加载失败')
          router.push('/')
        }
      })
      .catch(() => {
        toast.error('加载失败')
        router.push('/')
      })
      .finally(() => setLoading(false))
  }, [id, router])

  const handleDownload = async () => {
    if (!id) return
    window.open(`/api/export?summaryId=${id}`, '_blank')
  }

  const handleCopy = async () => {
    if (!detail) return
    try {
      await navigator.clipboard.writeText(detail.markdown)
      toast.success('已复制到剪贴板')
    } catch {
      toast.error('复制失败')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!detail) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              复制
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              下载 Markdown
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{detail.articleTitle}</h1>
          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600">
            {detail.articleAuthor && <span>作者: {detail.articleAuthor}</span>}
            <span>使用: {detail.provider.toUpperCase()}</span>
            <span>时间: {new Date(detail.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {detail.keywords.map((keyword: string) => (
              <Badge key={keyword} variant="secondary">{keyword}</Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">摘要预览</TabsTrigger>
            <TabsTrigger value="original">原文内容</TabsTrigger>
            <TabsTrigger value="markdown">Markdown 源码</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardContent className="pt-6 prose prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {detail.markdown}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="original">
            <Card>
              <CardHeader>
                <CardTitle>原文内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-gray-700 max-h-[600px] overflow-y-auto">
                  {detail.originalContent}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markdown">
            <Card>
              <CardHeader>
                <CardTitle>Markdown 源码</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {detail.markdown}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/')}>
            <Home className="mr-2 h-4 w-4" />
            返回首页继续
          </Button>
        </div>
      </main>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <ResultContent />
    </Suspense>
  )
}
