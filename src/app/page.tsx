'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'
import { Loader2, BookOpen, History, Settings, LogOut, LogIn } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">WeDigest</h1>
          </div>
          <div className="flex gap-2">
            {session ? (
              <>
                <Button variant="ghost" onClick={() => router.push('/history')}>
                  <History className="mr-2 h-4 w-4" />
                  历史记录
                </Button>
                <Button variant="ghost" onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </Button>
                <Button variant="ghost" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  退出
                </Button>
              </>
            ) : (
              <Button variant="ghost" onClick={() => router.push('/login')}>
                <LogIn className="mr-2 h-4 w-4" />
                登录
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            微信公众号文章智能摘要
          </h2>
          <p className="text-gray-600 text-lg">
            使用 AI 自动生成高质量文章摘要，支持多种 AI 模型
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>开始使用</CardTitle>
            <CardDescription>
              输入微信公众号文章链接，选择 AI 模型和摘要风格
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="url">文章链接</Label>
              <Input
                id="url"
                placeholder="https://mp.weixin.qq.com/s/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              />
            </div>

            <Tabs defaultValue="provider" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="provider">AI 供应商</TabsTrigger>
                <TabsTrigger value="style">摘要风格</TabsTrigger>
              </TabsList>
              <TabsContent value="provider" className="space-y-2">
                <Label>选择 AI 供应商</Label>
                <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">DeepSeek (推荐)</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="zhipu">智谱AI</SelectItem>
                  </SelectContent>
                </Select>
              </TabsContent>
              <TabsContent value="style" className="space-y-4">
                <div className="space-y-2">
                  <Label>摘要风格</Label>
                  <Select
                    value={summaryOptions.style}
                    onValueChange={(v) => setSummaryOptions({ ...summaryOptions, style: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">简洁版</SelectItem>
                      <SelectItem value="detailed">详细版 (推荐)</SelectItem>
                      <SelectItem value="bullet-points">要点版</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>输出语言</Label>
                  <Select
                    value={summaryOptions.language}
                    onValueChange={(v) => setSummaryOptions({ ...summaryOptions, language: v as any })}
                  >
                    <SelectTrigger>
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
              className="w-full"
              onClick={handleFetch}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中...
                </>
              ) : (
                '开始生成摘要'
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
