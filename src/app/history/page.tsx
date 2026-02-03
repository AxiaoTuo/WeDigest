'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { BookOpen, Home, Trash2, Eye, Sparkles, Clock, FileText, Search, Filter, Star, ArrowUpDown, X, CheckSquare } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { HistorySkeleton } from '@/components/skeleton/history-skeleton'
import { HistoryItem } from '@/types/api'
import { useDebounce } from '@/hooks/use-debounce'
import { TagFilter } from '@/components/tag-filter'

type SortField = 'createdAt' | 'title'
type SortOrder = 'asc' | 'desc'

export default function HistoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 10

  // 批量选择状态
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBatchMode, setIsBatchMode] = useState(false)

  // 筛选状态
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const [favoriteFilter, setFavoriteFilter] = useState<string>('all')
  const [tagFilters, setTagFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const hasFilters = debouncedSearch || providerFilter !== 'all' || favoriteFilter !== 'all' || tagFilters.length > 0

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('limit', limit.toString())
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (providerFilter !== 'all') params.set('provider', providerFilter)
    if (favoriteFilter !== 'all') params.set('favorite', favoriteFilter)
    if (tagFilters.length > 0) params.set('tags', tagFilters.join(','))
    params.set('sortBy', sortBy)
    params.set('sortOrder', sortOrder)
    return params.toString()
  }, [page, limit, debouncedSearch, providerFilter, favoriteFilter, tagFilters, sortBy, sortOrder])

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = buildQueryParams()
      const res = await fetch(`/api/history?${queryParams}`)
      const data = await res.json()
      if (data.success) {
        setItems(data.data.items)
        setTotal(data.data.total)
        // 清除无效的选中项
        setSelectedIds(prev => {
          const validIds = new Set(data.data.items.map((i: HistoryItem) => i.id))
          return new Set([...prev].filter(id => validIds.has(id)))
        })
      } else {
        toast.error(data.error || '加载失败')
      }
    } catch {
      toast.error('加载失败')
    } finally {
      setLoading(false)
    }
  }, [buildQueryParams])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // 筛选变化时重置页码
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, providerFilter, favoriteFilter, tagFilters, sortBy, sortOrder])

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return
    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('删除成功')
        fetchHistory()
      } else {
        toast.error(data.error || '删除失败')
      }
    } catch {
      toast.error('删除失败')
    }
  }

  const handleToggleFavorite = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/history/${id}/favorite`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !currentState })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(!currentState ? '已添加到收藏' : '已取消收藏')
        fetchHistory()
      } else {
        toast.error(data.error || '操作失败')
      }
    } catch {
      toast.error('操作失败')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setProviderFilter('all')
    setFavoriteFilter('all')
    setTagFilters([])
    setSortBy('createdAt')
    setSortOrder('desc')
  }

  const toggleSort = () => {
    if (sortBy === 'createdAt') {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy('createdAt')
      setSortOrder('desc')
    }
  }

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`确定要删除选中的 ${selectedIds.size} 条记录吗？`)) return

    try {
      const res = await fetch('/api/history/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          ids: Array.from(selectedIds)
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`成功删除 ${data.data.deleted} 条记录`)
        setSelectedIds(new Set())
        setIsBatchMode(false)
        fetchHistory()
      } else {
        toast.error(data.error || '批量删除失败')
      }
    } catch {
      toast.error('批量删除失败')
    }
  }

  const handleBatchFavorite = async (isFavorite: boolean) => {
    if (selectedIds.size === 0) return

    try {
      const res = await fetch('/api/history/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'favorite',
          ids: Array.from(selectedIds),
          isFavorite
        })
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`成功更新 ${data.data.updated} 条记录`)
        setSelectedIds(new Set())
        fetchHistory()
      } else {
        toast.error(data.error || '批量操作失败')
      }
    } catch {
      toast.error('批量操作失败')
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
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <nav className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80" onClick={() => router.push('/')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">WeDigest</h1>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" onClick={() => router.push('/app')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
              <FileText className="mr-2 h-4 w-4" />
              开始使用
            </Button>
            <Button variant="ghost" onClick={() => router.push('/settings')} className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
              设置
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">历史记录</h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">查看您的所有深度研报</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-xs sm:text-sm font-medium border border-indigo-200 dark:border-indigo-800">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>共 {total} 条记录</span>
              </div>
              <Button
                variant={isBatchMode ? "default" : "outline"}
                onClick={() => {
                  setIsBatchMode(!isBatchMode)
                  if (isBatchMode) setSelectedIds(new Set())
                }}
                className="h-9 text-sm transition-all duration-200"
              >
                {isBatchMode ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    退出批量模式
                  </>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    批量操作
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* 搜索和筛选栏 */}
          <Card className="border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
                {/* 搜索框 */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="搜索标题或作者..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-9 sm:h-10 transition-colors duration-200"
                  />
                </div>

                {/* 供应商筛选 */}
                <div className="w-full lg:w-40">
                  <Select value={providerFilter} onValueChange={setProviderFilter}>
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue placeholder="AI 供应商" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部供应商</SelectItem>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      <SelectItem value="zhipu">智谱AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 收藏筛选 */}
                <div className="w-full lg:w-32">
                  <Select value={favoriteFilter} onValueChange={setFavoriteFilter}>
                    <SelectTrigger className="h-9 sm:h-10">
                      <SelectValue placeholder="收藏" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="true">已收藏</SelectItem>
                      <SelectItem value="false">未收藏</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 标签筛选按钮 */}
                <Button
                  variant={tagFilters.length > 0 ? "default" : "outline"}
                  onClick={() => {
                    const tagFilter = document.getElementById('tag-filter-section')
                    tagFilter?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="h-9 sm:h-10 transition-all duration-200"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  标签
                  {tagFilters.length > 0 && <span className="ml-1 bg-white/20 px-1.5 rounded text-xs">{tagFilters.length}</span>}
                </Button>

                {/* 排序按钮 */}
                <Button
                  variant="outline"
                  onClick={toggleSort}
                  className="h-9 sm:h-10 transition-all duration-200"
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">{sortBy === 'createdAt' ? '时间' : '标题'}</span>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>

                {/* 清除筛选 */}
                {hasFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="h-9 sm:h-10 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 活跃筛选标签 */}
              {hasFilters && (
                <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-3">
                  {debouncedSearch && (
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" onClick={() => setSearch('')}>
                      <Search className="h-3 w-3" />
                      &quot;{debouncedSearch}&quot;
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {providerFilter !== 'all' && (
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" onClick={() => setProviderFilter('all')}>
                      <Sparkles className="h-3 w-3" />
                      {providerFilter.toUpperCase()}
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {tagFilters.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" onClick={() => setTagFilters(tagFilters.filter(t => t !== tag))}>
                      <Filter className="h-3 w-3" />
                      {tag}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                  {favoriteFilter === 'true' && (
                    <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200" onClick={() => setFavoriteFilter('all')}>
                      <Star className="h-3 w-3" />
                      已收藏
                      <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 标签筛选区域 */}
          <div id="tag-filter-section">
            <TagFilter
              selectedTags={tagFilters}
              onTagsChange={setTagFilters}
            />
          </div>
        </div>

        {loading ? (
          <HistorySkeleton />
        ) : items.length === 0 ? (
          <Card className="max-w-lg mx-auto border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
            <CardContent className="py-12 sm:py-16 text-center px-6">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 flex items-center justify-center shadow-inner">
                  <FileText className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {hasFilters ? '未找到匹配的记录' : '暂无历史记录'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 sm:mb-8">
                {hasFilters ? '尝试调整筛选条件' : '开始生成您的第一个深度研报吧'}
              </p>
              {hasFilters ? (
                <Button onClick={clearFilters} variant="outline" className="transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  清除筛选
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/app')}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200"
                >
                  <Home className="mr-2 h-4 w-4" />
                  开始使用
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 批量操作栏 */}
            {isBatchMode && selectedIds.size > 0 && (
              <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
                <Card className="shadow-2xl shadow-indigo-500/10 border-indigo-200 dark:border-indigo-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md">
                  <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">
                      已选择 <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedIds.size}</span> 项
                    </span>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBatchFavorite(true)}
                        className="text-slate-600 dark:text-slate-400 hover:text-yellow-600 dark:hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-colors duration-200"
                      >
                        <Star className="mr-1 h-4 w-4" />
                        <span className="hidden sm:inline">收藏</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBatchFavorite(false)}
                        className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                      >
                        <Star className="mr-1 h-4 w-4" />
                        <span className="hidden sm:inline">取消收藏</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleBatchDelete}
                        className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200"
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        <span className="hidden sm:inline">删除</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-3 sm:gap-4 mb-8">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className={`border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer group bg-white/90 dark:bg-slate-800/90 backdrop-blur-md ${
                    isBatchMode ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-background' : ''
                  }`}
                  onClick={() => !isBatchMode && router.push(`/result?id=${item.id}`)}
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* 多选 checkbox */}
                        {isBatchMode && (
                          <Checkbox
                            checked={selectedIds.has(item.id)}
                            onCheckedChange={() => toggleSelectOne(item.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                              {item.articleTitle}
                            </CardTitle>
                            <Button
                              size="sm"
                              variant="ghost"
                              className={`h-7 w-7 p-0 flex-shrink-0 transition-colors duration-200 ${item.isFavorite ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/30' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/30'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFavorite(item.id, item.isFavorite)
                              }}
                            >
                              <Star className={`h-4 w-4 ${item.isFavorite ? 'fill-current' : ''}`} />
                            </Button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                            {item.articleAuthor && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span className="truncate max-w-24">{item.articleAuthor}</span>
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
                      </div>
                      <div className="flex gap-1 sm:gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 sm:w-9 p-0 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/result?id=${item.id}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 sm:w-9 p-0 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {item.keywords.slice(0, 4).map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors duration-200">
                          {keyword}
                        </Badge>
                      ))}
                      {item.keywords.length > 4 && (
                        <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          +{item.keywords.length - 4}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 sm:gap-4 pt-6 sm:pt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="w-20 sm:w-24 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </Button>
                <div className="flex items-center gap-2 px-4 sm:px-6 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">第</span>
                  <span className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">{page}</span>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">/ {totalPages}</span>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">页</span>
                </div>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="w-20 sm:w-24 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
    </AuthGuard>
  )
}
