'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { useAppStore } from '@/store/app-store'
import { useStreamingSummary } from '@/hooks/use-streaming-summary'
import { AIProviderType } from '@/types/ai-provider'
import { Loader2, BookOpen, History, Settings, ArrowLeft, Zap, Globe, Sparkles, Wand2, CheckCircle2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function AppPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [url, setUrl] = useState('')
  const [useStreaming, setUseStreaming] = useState(true)
  const [useComparison, setUseComparison] = useState(false)
  const [selectedProviders, setSelectedProviders] = useState<string[]>(['deepseek', 'openai'])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [streamingCompleteId, setStreamingCompleteId] = useState<string | null>(null)
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

  const { isStreaming, streamedContent, startStreaming, cancelStreaming, resetStreaming } = useStreamingSummary()

  // 加载模板列表
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/prompt-templates')
        const data = await response.json()
        if (data.success) {
          setTemplates(data.data)
        }
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }

    if (session) {
      fetchTemplates()
    }
  }, [session])

  // 当流式输出完成时自动跳转
  useEffect(() => {
    if (streamingCompleteId) {
      const timer = setTimeout(() => {
        router.push(`/result?id=${streamingCompleteId}`)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [streamingCompleteId, router])

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

      // 对比模式
      if (useComparison) {
        toast.success('文章抓取成功，正在生成对比...')

        try {
          const compareRes = await fetch('/api/summarize/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articleUrl: url,
              content: fetchData.data.article.content,
              title: fetchData.data.article.title,
              author: fetchData.data.article.author,
              providers: selectedProviders,
              options: summaryOptions,
              templateId: (selectedTemplate && selectedTemplate !== '__default__') ? selectedTemplate : undefined
            })
          })

          const compareData = await compareRes.json()

          if (!compareData.success) {
            toast.error(compareData.error || '对比失败')
            setIsLoading(false)
            return
          }

          // 跳转到对比结果页面
          const encodedData = encodeURIComponent(JSON.stringify(compareData.data))
          router.push(`/compare?data=${encodedData}`)
        } catch (error) {
          console.error(error)
          toast.error('对比失败')
          setIsLoading(false)
        }
        return
      }

      // 使用流式输出
      if (useStreaming) {
        toast.success('文章抓取成功，正在生成摘要...')

        startStreaming(
          url,
          fetchData.data.article.content,
          fetchData.data.article.title,
          fetchData.data.article.author,
          selectedProvider,
          summaryOptions,
          selectedTemplate || undefined,
          {
            onChunk: (content) => {
              // 可以在这里添加额外的处理
            },
            onComplete: (result, id) => {
              toast.success('摘要生成成功')
              setStreamingCompleteId(id)
            },
            onError: (error) => {
              toast.error(error || 'AI 总结失败')
              setIsLoading(false)
            }
          }
        )
      } else {
        // 非流式输出
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
            options: summaryOptions,
            templateId: (selectedTemplate && selectedTemplate !== '__default__') ? selectedTemplate : undefined
          })
        })

        const summarizeData = await summarizeRes.json()

        if (!summarizeData.success) {
          toast.error(summarizeData.error || 'AI 总结失败')
          setIsLoading(false)
          return
        }

        toast.success('摘要生成成功')
        router.push(`/result?id=${summarizeData.data.id}`)
      }
    } catch (error) {
      console.error(error)
      toast.error('请求失败，请稍后重试')
      setError(error instanceof Error ? error.message : '未知错误')
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    cancelStreaming()
    setIsLoading(false)
    resetStreaming()
    toast.info('已取消生成')
  }

  const isProcessing = isLoading || isStreaming

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">WeDigest</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.push('/')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
            <Button variant="ghost" onClick={() => router.push('/history')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <History className="mr-2 h-4 w-4" />
              历史记录
            </Button>
            <Button variant="ghost" onClick={() => router.push('/templates')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <Wand2 className="mr-2 h-4 w-4" />
              模板库
            </Button>
            <Button variant="ghost" onClick={() => router.push('/settings')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-6 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">生成深度研报</h2>
              <p className="text-slate-600 dark:text-slate-400">输入文章链接，AI 自动生成架构师视角的学习笔记</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* 输入区域 */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                文章链接
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                支持微信公众号文章，自动抓取并生成深度研报
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium text-slate-700 dark:text-slate-300">文章链接</Label>
                <Input
                  id="url"
                  placeholder="https://mp.weixin.qq.com/s/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleFetch()}
                  className="h-12 text-base"
                  disabled={isProcessing}
                />
              </div>

              <Tabs defaultValue="provider" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="provider" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">AI 供应商</TabsTrigger>
                  <TabsTrigger value="template" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Prompt 模板</TabsTrigger>
                  <TabsTrigger value="compare" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">对比模式</TabsTrigger>
                  <TabsTrigger value="style" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">输出设置</TabsTrigger>
                </TabsList>
                <TabsContent value="provider" className="space-y-2 mt-4">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">选择 AI 供应商</Label>
                  <Select value={selectedProvider} onValueChange={(v) => setSelectedProvider(v as AIProviderType)} disabled={isProcessing}>
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
                <TabsContent value="template" className="space-y-2 mt-4">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">选择 Prompt 模板</Label>
                  <Select value={selectedTemplate || '__default__'} onValueChange={setSelectedTemplate} disabled={isProcessing}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="使用默认模板" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__default__">默认模板（深度研报）</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.isSystem && <span className="text-xs mr-1">⚡</span>}
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {selectedTemplate === '__default__'
                        ? '使用系统默认的深度研报模板，适用于技术博客、架构文档等专业内容'
                        : templates.find(t => t.id === selectedTemplate)?.description || '自定义模板'}
                    </p>
                  )}
                </TabsContent>
                <TabsContent value="compare" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">启用多模型对比</Label>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                      <input
                        type="checkbox"
                        id="comparison"
                        checked={useComparison}
                        onChange={(e) => setUseComparison(e.target.checked)}
                        disabled={isProcessing}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <Label htmlFor="comparison" className="text-sm cursor-pointer flex-1">
                        同时使用多个 AI 模型生成摘要，对比输出结果
                      </Label>
                    </div>
                  </div>

                  {useComparison && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">选择对比模型（至少2个）</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['deepseek', 'openai', 'zhipu'].map((provider) => (
                          <button
                            key={provider}
                            onClick={() => {
                              if (selectedProviders.includes(provider)) {
                                if (selectedProviders.length > 2) {
                                  setSelectedProviders(selectedProviders.filter(p => p !== provider))
                                }
                              } else {
                                setSelectedProviders([...selectedProviders, provider])
                              }
                            }}
                            disabled={isProcessing}
                            className={`p-3 rounded-lg border-2 text-center transition-all ${
                              selectedProviders.includes(provider)
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <div className="text-sm font-medium">
                              {provider === 'deepseek' ? 'DeepSeek' : provider === 'openai' ? 'OpenAI' : '智谱AI'}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        选择 2-3 个模型进行对比，结果将在新页面中并排展示
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="style" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">输出语言</Label>
                    <Select
                      value={summaryOptions.language}
                      onValueChange={(v) => setSummaryOptions({ ...summaryOptions, language: v as 'zh' | 'en' })}
                      disabled={isProcessing}
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

              {/* 流式输出开关 */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <Label htmlFor="streaming" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    实时流式输出
                  </Label>
                </div>
                <Switch
                  id="streaming"
                  checked={useStreaming}
                  onCheckedChange={setUseStreaming}
                  disabled={isProcessing}
                />
              </div>

              {!isProcessing ? (
                <Button
                  className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleFetch}
                >
                  {useComparison ? '开始对比' : '生成深度研报'}
                  <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
                </Button>
              ) : (
                <Button
                  className="w-full h-12 text-base bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all"
                  onClick={handleCancel}
                >
                  取消生成
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 实时输出区域 */}
          <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-slate-900 dark:text-slate-100">
                <span className="flex items-center gap-2">
                  {isStreaming ? (
                    <>
                      <Loader2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      正在生成中...
                    </>
                  ) : streamingCompleteId ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      生成完成
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      预览区域
                    </>
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {isStreaming || streamedContent ? (
                <div className="h-full overflow-y-auto prose prose-slate dark:prose-invert max-w-none text-sm">
                  <div className="flex items-center gap-2 mb-3 text-indigo-600 dark:text-indigo-400">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse" />
                    <span className="text-xs font-medium">AI 实时输出</span>
                  </div>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamedContent || '_等待生成..._'}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">AI 生成的内容将实时显示在这里</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              支持格式
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>微信公众号文章</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>Markdown 格式输出</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>YAML 元数据</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                <span>实时流式输出</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
