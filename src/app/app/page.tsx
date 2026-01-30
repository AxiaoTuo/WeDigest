'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'
import { AIProviderType } from '@/types/ai-provider'
import { Loader2, BookOpen, History, Settings, LogOut, ArrowLeft, Zap, Globe, Sparkles } from 'lucide-react'

export default function AppPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [url, setUrl] = useState('')
  const {
    setArticle,
    selectedProvider,
    setSelectedProvider,
    summaryOptions,
    setSummaryOptions,
    isLoading,
    setIsLoading,
    setError
  } = useAppStore()

  const handleFetch = async () => {
    if (!session) {
      toast.error('请先登录')
      router.push('/login')
      return
    }

    if (!url.trim()) {
      toast.error('请输入文章链接')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const fetchRes = await fetch('/api/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })

      const fetchData = await fetchRes.json()

      if (!fetchData.success) {
        toast.error(fetchData.error || '抓取失败')
        setIsLoading(false)
        return
      }

      setArticle(fetchData.data.article)
      toast.success('文章抓取成功，正在生成摘要...')

      const summarizeRes = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleUrl: url,
          content: fetchData.data.article.content,
          title: fetchData.data.article.title,
          author: fetchData.data.article.author,
          provider: selectedProvider,
          options: summaryOptions
        })
      })

      const summarizeData = await summarizeRes.json()

      if (!summarizeData.success) {
        toast.error(summarizeData.error || 'AI 总结失败')
        return
      }

      toast.success('摘要生成成功')
      router.push(`/result?id=${summarizeData.data.id}`)
    } catch (error) {
      console.error(error)
      toast.error('请求失败，请稍后重试')
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setIsLoading(false)
    }
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
            <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-700 hover:text-slate-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
            <Button variant="ghost" onClick={() => router.push('/history')} className="text-slate-700 hover:text-slate-900">
              <History className="mr-2 h-4 w-4" />
              历史记录
            </Button>
            <Button variant="ghost" onClick={() => router.push('/settings')} className="text-slate-700 hover:text-slate-900">
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-6 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">生成深度研报</h2>
              <p className="text-slate-600">输入文章链接，AI 自动生成架构师视角的学习笔记</p>
            </div>
          </div>
        </div>

        <Card className="border-2 border-slate-200 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600" />
              文章链接
            </CardTitle>
            <CardDescription>
              支持微信公众号文章，自动抓取并生成深度研报
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-sm font-medium text-slate-700">文章链接</Label>
              <Input
                id="url"
                placeholder="https://mp.weixin.qq.com/s/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                className="h-12 text-base"
              />
            </div>

            <Tabs defaultValue="provider" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100">
                <TabsTrigger value="provider" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">AI 供应商</TabsTrigger>
                <TabsTrigger value="style" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">输出设置</TabsTrigger>
              </TabsList>
              <TabsContent value="provider" className="space-y-2 mt-4">
                <Label className="text-sm font-medium text-slate-700">选择 AI 供应商</Label>
                <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as AIProviderType)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek (推荐)</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="zhipu">智谱AI</SelectItem>
                  </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="style" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">输出语言</Label>
                  <Select
                    value={summaryOptions.language}
                    onValueChange={(v) => setSummaryOptions({ ...summaryOptions, language: v as 'zh' | 'en' })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              onClick={handleFetch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  生成深度研报
                  <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600" />
              支持格式
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>微信公众号文章</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>Markdown 格式输出</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>YAML 元数据</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span>多语言支持</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
