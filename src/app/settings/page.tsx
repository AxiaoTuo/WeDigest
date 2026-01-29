'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Save, Eye, EyeOff, Trash2, Check } from 'lucide-react'
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
        // Ensure all values are strings, never null/undefined
        setApiKey(data.data.decryptedKey || '')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Button variant="ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>
          <h1 className="text-xl font-bold">设置</h1>
          <div className="w-24" />
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>AI API Key 配置</CardTitle>
            <CardDescription>
              配置 AI 供应商的 API Key，数据加密存储在数据库中
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeProvider} onValueChange={(v) => setActiveProvider(v as AIProviderType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="deepseek" className="relative">
                  DeepSeek
                  {hasKey('deepseek') && (
                    <Check className="absolute top-1 right-1 h-3 w-3 text-green-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="openai" className="relative">
                  OpenAI
                  {hasKey('openai') && (
                    <Check className="absolute top-1 right-1 h-3 w-3 text-green-600" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="zhipu" className="relative">
                  智谱AI
                  {hasKey('zhipu') && (
                    <Check className="absolute top-1 right-1 h-3 w-3 text-green-600" />
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deepseek" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-1">DeepSeek API Key 获取</p>
                  <p className="text-gray-600">访问 <a href="https://platform.deepseek.com" target="_blank" className="text-blue-600 underline">platform.deepseek.com</a> 注册并获取 API Key</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deepseek-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="deepseek-key"
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={apiKey ?? ''}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deepseek-url">API 地址（可选）</Label>
                  <Input
                    id="deepseek-url"
                    type="text"
                    placeholder="https://api.deepseek.com"
                    value={baseUrl ?? ''}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deepseek-model">模型名称（可选）</Label>
                  <Input
                    id="deepseek-model"
                    type="text"
                    placeholder="deepseek-chat"
                    value={modelName ?? ''}
                    onChange={(e) => setModelName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  {hasKey('deepseek') && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete('deepseek')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleTest}
                  >
                    测试连接
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="openai" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-1">OpenAI API Key 获取</p>
                  <p className="text-gray-600">访问 <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 underline">platform.openai.com/api-keys</a> 获取</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openai-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="openai-key"
                      type={showKey ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={apiKey ?? ''}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openai-url">API 地址（可选）</Label>
                  <Input
                    id="openai-url"
                    type="text"
                    placeholder="https://api.openai.com/v1"
                    value={baseUrl ?? ''}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="openai-model">模型名称（可选）</Label>
                  <Input
                    id="openai-model"
                    type="text"
                    placeholder="gpt-4o-mini"
                    value={modelName ?? ''}
                    onChange={(e) => setModelName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  {hasKey('openai') && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete('openai')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleTest}
                  >
                    测试连接
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="zhipu" className="space-y-4 pt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-medium mb-1">智谱AI API Key 获取</p>
                  <p className="text-gray-600">访问 <a href="https://open.bigmodel.cn" target="_blank" className="text-blue-600 underline">open.bigmodel.cn</a> 注册并获取</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zhipu-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="zhipu-key"
                      type={showKey ? 'text' : 'password'}
                      placeholder="..."
                      value={apiKey ?? ''}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zhipu-url">API 地址（可选）</Label>
                  <Input
                    id="zhipu-url"
                    type="text"
                    placeholder="https://open.bigmodel.cn/api/paas/v4"
                    value={baseUrl ?? ''}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zhipu-model">模型名称（可选）</Label>
                  <Input
                    id="zhipu-model"
                    type="text"
                    placeholder="glm-4-flash"
                    value={modelName ?? ''}
                    onChange={(e) => setModelName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    保存
                  </Button>
                  {hasKey('zhipu') && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete('zhipu')}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleTest}
                  >
                    测试连接
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>已配置的 API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无已配置的 API Key</p>
            ) : (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.provider}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <Badge variant="outline">{key.provider.toUpperCase()}</Badge>
                      <span className="ml-2 text-sm text-gray-600">
                        配置于 {new Date(key.createdAt).toLocaleString()}
                      </span>
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
      </main>
    </div>
  )
}
