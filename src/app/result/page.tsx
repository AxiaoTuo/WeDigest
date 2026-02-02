'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { ArrowLeft, Download, Copy, Home, Loader2, FileJson, FileCode, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ResultSkeleton } from '@/components/skeleton/result-skeleton'
import { HistoryDetail } from '@/types/api'

type ExportFormat = 'md' | 'json' | 'html' | 'notion'

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

  const handleDownload = (format: ExportFormat = 'md') => {
    if (!id) return
    window.open(`/api/export?summaryId=${id}&format=${format}`, '_blank')
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Button variant="ghost" disabled className="opacity-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <ThemeToggle />
          </div>
        </nav>
        <main className="container mx-auto max-w-5xl px-4 py-8">
          <ResultSkeleton />
        </main>
      </div>
    )
  }

  if (!detail) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleCopy} className="text-slate-700 dark:text-slate-300">
              <Copy className="mr-2 h-4 w-4" />
              复制
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <Download className="mr-2 h-4 w-4" />
                  导出
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleDownload('md')}>
                  <Download className="mr-2 h-4 w-4" />
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('html')}>
                  <FileCode className="mr-2 h-4 w-4" />
                  HTML (.html)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('json')}>
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON (.json)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('notion')}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Notion (.md)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">{detail.articleTitle}</h1>
          <div className="flex flex-wrap gap-2 items-center text-sm text-gray-600 dark:text-slate-400">
            {detail.articleAuthor && <span>作者: {detail.articleAuthor}</span>}
            <span>使用: {detail.provider.toUpperCase()}</span>
            <span>时间: {new Date(detail.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {detail.keywords.map((keyword: string) => (
              <Badge key={keyword} variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">{keyword}</Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800">
            <TabsTrigger value="summary" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">摘要预览</TabsTrigger>
            <TabsTrigger value="original" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">原文内容</TabsTrigger>
            <TabsTrigger value="markdown" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Markdown 源码</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardContent className="pt-6 prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {detail.markdown}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="original">
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">原文内容</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-slate-300 max-h-[600px] overflow-y-auto">
                  {detail.originalContent}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="markdown">
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-slate-100">Markdown 源码</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 dark:bg-slate-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {detail.markdown}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => router.push('/')} className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
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
