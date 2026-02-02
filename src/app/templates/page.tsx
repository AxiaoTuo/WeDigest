'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { PromptTemplate, PROMPT_CATEGORIES, PromptCategory } from '@/types/prompt'
import { BookOpen, History, Settings, ArrowLeft, Sparkles, Plus, Edit, Trash2, Star, Search, Copy, Wand2 } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export default function TemplatesPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [templates, setTemplates] = useState<PromptTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'custom' as PromptCategory,
    prompt: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchTemplates()
    }
  }, [status, categoryFilter])

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter)
      }

      const response = await fetch(`/api/prompt-templates?${params}`)
      const data = await response.json()

      if (data.success) {
        setTemplates(data.data)
      }
    } catch (error) {
      toast.error('加载模板失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingTemplate(null)
    setFormData({
      name: '',
      description: '',
      category: 'custom',
      prompt: ''
    })
    setDialogOpen(true)
  }

  const handleEdit = (template: PromptTemplate) => {
    if (template.id.startsWith('preset_')) {
      toast.info('预设模板不支持编辑，可以复制后修改')
      // 复制模板
      setFormData({
        name: `${template.name} (副本)`,
        description: template.description || '',
        category: template.category as PromptCategory,
        prompt: template.prompt
      })
      setEditingTemplate(null)
    } else {
      setEditingTemplate(template)
      setFormData({
        name: template.name,
        description: template.description || '',
        category: template.category as PromptCategory,
        prompt: template.prompt
      })
    }
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个模板吗？')) return

    try {
      const response = await fetch(`/api/prompt-templates/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast.success('删除成功')
        fetchTemplates()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleToggleFavorite = async (template: PromptTemplate) => {
    if (template.id.startsWith('preset_')) {
      toast.info('预设模板不支持收藏')
      return
    }

    try {
      const response = await fetch(`/api/prompt-templates/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFavorite: !template.isFavorite
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchTemplates()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch (error) {
      toast.error('操作失败')
    }
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('请输入模板名称')
      return
    }
    if (!formData.prompt.trim()) {
      toast.error('请输入 Prompt 内容')
      return
    }

    try {
      const url = editingTemplate
        ? `/api/prompt-templates/${editingTemplate.id}`
        : '/api/prompt-templates'

      const method = editingTemplate ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success(editingTemplate ? '更新成功' : '创建成功')
        setDialogOpen(false)
        fetchTemplates()
      } else {
        toast.error(data.error || '保存失败')
      }
    } catch (error) {
      toast.error('保存失败')
    }
  }

  const extractVariables = (prompt: string) => {
    const matches = prompt.match(/\{(\w+)\}/g)
    return matches ? [...new Set(matches)] : []
  }

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="container mx-auto flex items-center justify-between px-6 py-4">
            <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="flex items-center gap-2">
              <div className="h-10 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-10 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            </div>
          </div>
        </nav>
        <main className="container mx-auto max-w-6xl px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-48 animate-pulse" />
            ))}
          </div>
        </main>
      </div>
    )
  }

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
            <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              开始使用
            </Button>
            <Button variant="ghost" onClick={() => router.push('/history')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <History className="mr-2 h-4 w-4" />
              历史记录
            </Button>
            <Button variant="ghost" onClick={() => router.push('/settings')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Prompt 模板库</h2>
              <p className="text-slate-600 dark:text-slate-400">管理和自定义你的 AI 提示词模板</p>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            创建模板
          </Button>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索模板..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-10 w-full sm:w-48">
                  <SelectValue placeholder="全部分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {Object.entries(PROMPT_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 模板列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className="border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      {template.isSystem && (
                        <Badge variant="secondary" className="text-xs">预设</Badge>
                      )}
                    </div>
                    {template.description && (
                      <CardDescription className="text-sm">{template.description}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleToggleFavorite(template)}
                  >
                    <Star className={`h-4 w-4 ${template.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {PROMPT_CATEGORIES[template.category as PromptCategory] || template.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    使用 {template.usageCount} 次
                  </Badge>
                </div>

                {/* 变量标签 */}
                {extractVariables(template.prompt).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {extractVariables(template.prompt).slice(0, 3).map((v, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {v}
                      </Badge>
                    ))}
                    {extractVariables(template.prompt).length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{extractVariables(template.prompt).length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    {template.id.startsWith('preset_') ? '复制' : '编辑'}
                  </Button>
                  {!template.id.startsWith('preset_') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <Wand2 className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">暂无模板</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {search ? '没有找到匹配的模板' : '创建你的第一个自定义模板'}
            </p>
            {!search && (
              <Button onClick={handleCreate}>
                <Plus className="mr-2 h-4 w-4" />
                创建模板
              </Button>
            )}
          </div>
        )}
      </main>

      {/* 编辑/创建对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              {editingTemplate ? '编辑模板' : '创建模板'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? '修改你的自定义 Prompt 模板' : '创建一个新的自定义 Prompt 模板'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">模板名称 *</Label>
              <Input
                id="name"
                placeholder="例如：技术文章摘要"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Input
                id="description"
                placeholder="简要描述这个模板的用途"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as PromptCategory })}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROMPT_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt 内容 *</Label>
              <Textarea
                id="prompt"
                placeholder="输入你的 Prompt，使用 {variable} 定义变量，例如：请用 {language} 总结以下内容：{content}"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                提示：使用 {'{variable}'} 格式定义变量，例如 {'{content}'}, {'{language}'}
              </p>
            </div>

            {/* 预览变量 */}
            {extractVariables(formData.prompt).length > 0 && (
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">检测到的变量：</p>
                <div className="flex flex-wrap gap-2">
                  {extractVariables(formData.prompt).map((v, i) => (
                    <Badge key={i} variant="secondary">{v}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {editingTemplate ? '更新' : '创建'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
