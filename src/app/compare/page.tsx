'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Save, Clock, FileText, CheckCircle2, XCircle, Zap, Loader2, BookOpen, Settings, History, Wand2, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { ResultSkeleton } from '@/components/skeleton/result-skeleton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ComparisonResult {
  provider: string
  success: boolean
  result?: {
    title: string
    summary: string
    keywords: string[]
    highlights: string[]
    readingTime: number
    markdown: string
  }
  error?: string
  duration: number
}

interface ComparisonData {
  articleUrl: string
  articleTitle: string
  articleAuthor?: string
  originalContent: string
  results: ComparisonResult[]
  stats: {
    successCount: number
    totalCount: number
    avgDuration: number
    avgLength: number
  }
}

const PROVIDER_NAMES: Record<string, string> = {
  openai: 'OpenAI',
  deepseek: 'DeepSeek',
  zhipu: '智谱AI'
}

const PROVIDER_COLORS: Record<string, string> = {
  openai: 'bg-emerald-500',
  deepseek: 'bg-blue-500',
  zhipu: 'bg-purple-500'
}

function CompareContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<ComparisonData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const compareData = searchParams.get('data')
    if (!compareData) {
      router.push('/app')
      return
    }

    try {
      const parsed = JSON.parse(decodeURIComponent(compareData))
      setData(parsed)
    } catch (error) {
      toast.error('数据解析失败')
      router.push('/app')
    } finally {
      setLoading(false)
    }
  }, [searchParams, router])

  const handleSave = async (provider: string) => {
    const result = data?.results.find(r => r.provider === provider)
    if (!result || !result.result) return

    setSaving(true)
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleUrl: data!.articleUrl,
          articleTitle: data!.articleTitle,
          articleAuthor: data!.articleAuthor,
          originalContent: data!.originalContent,
          summary: result.result.summary,
          markdown: result.result.markdown,
          keywords: result.result.keywords,
          provider: result.provider
        })
      })

      const res = await response.json()
      if (res.success) {
        toast.success('保存成功')
        router.push(`/result?id=${res.data.id}`)
      } else {
        toast.error(res.error || '保存失败')
      }
    } catch (error) {
      toast.error('保存失败')
    } finally {
      setSaving(false)
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
        <main className="container mx-auto max-w-7xl px-4 py-8">
          <ResultSkeleton />
        </main>
      </div>
    )
  }

  if (!data) return null

  const successfulResults = data.results.filter(r => r.success)
  const failedResults = data.results.filter(r => !r.success)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-700 dark:text-slate-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 dark:text-slate-300">
              <Sparkles className="mr-2 h-4 w-4" />
              开始使用
            </Button>
            <Button variant="ghost" onClick={() => router.push('/templates')} className="text-slate-700 dark:text-slate-300">
              <Wand2 className="mr-2 h-4 w-4" />
              模板库
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-7xl px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">多模型对比结果</h1>
              <p className="text-slate-600 dark:text-slate-400">{data.articleTitle}</p>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">成功</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{data.stats.successCount}/{data.stats.totalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">平均耗时</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{data.stats.avgDuration}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">平均字数</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{data.stats.avgLength}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">最快模型</p>
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      {successfulResults.length > 0
                        ? PROVIDER_NAMES[successfulResults.sort((a, b) => a.duration - b.duration)[0].provider]
                        : '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 对比结果 */}
        <div className="space-y-6">
          {/* 成功的结果 */}
          {successfulResults.map((result) => (
            <Card
              key={result.provider}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg ${PROVIDER_COLORS[result.provider]} flex items-center justify-center text-white font-bold text-sm`}>
                      {PROVIDER_NAMES[result.provider][0]}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{PROVIDER_NAMES[result.provider]}</CardTitle>
                      <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {result.duration}ms
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {result.result!.markdown.length} 字
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {result.result!.readingTime} 分钟
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSave(result.provider)}
                    disabled={saving}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    保存此结果
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="preview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">内容预览</TabsTrigger>
                    <TabsTrigger value="summary" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">摘要</TabsTrigger>
                    <TabsTrigger value="keywords" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">关键词</TabsTrigger>
                    <TabsTrigger value="markdown" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">Markdown</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview">
                    <div className="bg-white dark:bg-slate-950 rounded-lg p-6 max-h-[500px] overflow-y-auto prose prose-slate dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {result.result!.markdown}
                      </ReactMarkdown>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary">
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                      <p className="text-slate-700 dark:text-slate-300">{result.result!.summary}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="keywords">
                    <div className="flex flex-wrap gap-2">
                      {result.result!.keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="markdown">
                    <pre className="bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm max-h-[500px] overflow-y-auto">
                      {result.result!.markdown}
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}

          {/* 失败的结果 */}
          {failedResults.map((result) => (
            <Card key={result.provider} className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{PROVIDER_NAMES[result.provider]}</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <CompareContent />
    </Suspense>
  )
}
