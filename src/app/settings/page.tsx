'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BookOpen, Save, Eye, EyeOff, Trash2, Settings as SettingsIcon, Sparkles, ExternalLink, Key, CheckCircle2, AlertCircle } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { AIProviderType } from '@/types/ai-provider'

interface ApiKeyStatus {
  provider: string
  isActive: boolean
  createdAt: string
  baseUrl?: string
  modelName?: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [activeProvider, setActiveProvider] = useState<AIProviderType>('deepseek')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [modelName, setModelName] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [apiKeys, setApiKeys] = useState<ApiKeyStatus[]>([])

  const providers = [
    {
      id: 'deepseek' as AIProviderType,
      name: 'DeepSeek',
      url: 'https://platform.deepseek.com',
      placeholder: 'sk-...',
      defaultModel: 'deepseek-chat'
    },
    {
      id: 'openai' as AIProviderType,
      name: 'OpenAI',
      url: 'https://platform.openai.com/api-keys',
      placeholder: 'sk-...',
      defaultModel: 'gpt-4o-mini'
    },
    {
      id: 'zhipu' as AIProviderType,
      name: '智谱AI',
      url: 'https://open.bigmodel.cn',
      placeholder: '...',
      defaultModel: 'glm-4-flash'
    }
  ]

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/settings/api-key')
      const data = await res.json()
      if (data.success) {
        setApiKeys(data.data || [])
      }
    } catch {
      toast.error('加载 API Key 状态失败')
    }
  }

  const fetchCurrentKey = async (provider: AIProviderType) => {
    try {
      const res = await fetch(`/api/settings/api-key?provider=${provider}`)
      const data = await res.json()
      if (data.success && data.data) {
        setApiKey(data.data.decryptedKey)
        setBaseUrl(data.data.baseUrl || '')
        setModelName(data.data.modelName || '')
      } else {
        setApiKey('')
        setBaseUrl('')
        setModelName('')
      }
    } catch {
      setApiKey('')
      setBaseUrl('')
      setModelName('')
    }
  }

  useEffect(() => {
    fetchApiKeys()
  }, [])

  useEffect(() => {
    fetchCurrentKey(activeProvider)
  }, [activeProvider])

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('请输入 API Key')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/settings/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider, apiKey, baseUrl, modelName })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('保存成功')
        fetchApiKeys()
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (provider: string) => {
    if (!confirm(`确定要删除 ${provider.toUpperCase()} 的 API Key 吗？`)) return
    try {
      const res = await fetch(`/api/settings/api-key?provider=${provider}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        toast.success('删除成功')
        fetchApiKeys()
        if (provider === activeProvider) {
          setApiKey('')
          setBaseUrl('')
          setModelName('')
        }
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch {
      toast.error('删除失败')
    }
  }

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error('请先输入 API Key')
      return
    }

    try {
      toast.loading('测试中...', { id: 'test-api' })
      const res = await fetch('/api/settings/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: activeProvider })
      })
      const data = await res.json()
      toast.dismiss('test-api')
      if (data.success) {
        toast.success('API 连接测试成功！')
      } else {
        toast.error(`测试失败: ${data.error}`)
      }
    } catch {
      toast.dismiss('test-api')
      toast.error('测试失败，请检查网络连接')
    }
  }

  const hasKey = (provider: string) =>
    apiKeys.some((k) => k.provider === provider && k.isActive)

  return (
    <AuthGuard>
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
            <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              开始使用
            </Button>
            <Button variant="ghost" onClick={() => router.push('/history')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              历史记录
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">API 配置</h2>
              <p className="text-slate-600 dark:text-slate-400">配置您的 AI API Key，数据加密存储</p>
            </div>
          </div>
        </div>

        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Key className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              AI API Key 配置
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              配置 AI 供应商的 API Key，所有数据加密存储在本地数据库中
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeProvider} onValueChange={(v) => setActiveProvider(v as AIProviderType)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
                {providers.map((provider) => (
                  <TabsTrigger
                    key={provider.id}
                    value={provider.id}
                    className="relative data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm"
                  >
                    {provider.name}
                    {hasKey(provider.id) && (
                      <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-green-600 dark:text-green-400" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {providers.map((provider) => (
                <TabsContent key={provider.id} value={provider.id} className="space-y-6 pt-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">{provider.name} API Key 获取</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span>访问</span>
                          <a
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-medium flex items-center gap-1"
                          >
                            {provider.url}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <span>注册并获取</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-key`} className="text-sm font-medium text-slate-700 dark:text-slate-300">API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`${provider.id}-key`}
                        type={showKey ? 'text' : 'password'}
                        placeholder={provider.placeholder}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="h-12"
                      />
                      <Button
                        variant="outline"
                        onClick={() => setShowKey(!showKey)}
                        className="px-3"
                      >
                        {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-url`} className="text-sm font-medium text-slate-700 dark:text-slate-300">API 地址（可选）</Label>
                    <Input
                      id={`${provider.id}-url`}
                      type="text"
                      placeholder={provider.url}
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`${provider.id}-model`} className="text-sm font-medium text-slate-700 dark:text-slate-300">模型名称（可选）</Label>
                    <Input
                      id={`${provider.id}-model`}
                      type="text"
                      placeholder={provider.defaultModel}
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="h-12"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? '保存中...' : '保存'}
                    </Button>
                    {hasKey(provider.id) && (
                      <Button
                        variant="outline"
                        onClick={() => handleDelete(provider.id)}
                        className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        删除
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleTest}
                      className="text-slate-700 dark:text-slate-300"
                    >
                      测试连接
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">已配置的 API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Key className="h-6 w-6 text-slate-400 dark:text-slate-600" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400">暂无已配置的 API Key</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.provider}
                    className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all bg-white/30 dark:bg-slate-900/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${key.isActive ? 'bg-green-100 dark:bg-green-950/50' : 'bg-slate-100 dark:bg-slate-800'}`}>
                        {key.isActive ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-medium">
                            {key.provider.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          配置于 {new Date(key.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <Badge variant={key.isActive ? 'default' : 'secondary'}>
                      {key.isActive ? '已激活' : '未激活'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800 mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">安全提示</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 flex-shrink-0" />
                    <span>API Key 使用 AES 加密存储在本地数据库</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 flex-shrink-0" />
                    <span>定期更换 API Key 以提高安全性</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-2 flex-shrink-0" />
                    <span>不要将 API Key 分享给他人</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    </AuthGuard>
  )
}
