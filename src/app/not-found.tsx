'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* 404 大数字 */}
        <div className="relative mb-8">
          <h1 className="text-[180px] md:text-[220px] font-bold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-24 w-24 text-slate-200 dark:text-slate-800" />
          </div>
        </div>

        {/* 标题和描述 */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          页面未找到
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          抱歉，您访问的页面不存在。可能是链接错误或页面已被移动。
        </p>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            className="h-12 px-8 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              返回首页
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 text-base border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            onClick={() => window.history.back()}
          >
            <span>
              <ArrowLeft className="mr-2 h-5 w-5" />
              返回上一页
            </span>
          </Button>
        </div>

        {/* 建议链接 */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">您可能在寻找：</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="ghost" asChild className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              <Link href="/app">开始使用</Link>
            </Button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Button variant="ghost" asChild className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              <Link href="/history">历史记录</Link>
            </Button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Button variant="ghost" asChild className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
              <Link href="/settings">设置</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
