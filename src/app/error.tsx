'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, RefreshCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录错误到错误报告服务
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center px-6 py-12">
      <Card className="max-w-lg w-full border-2 border-red-200 dark:border-red-900 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 md:p-12 text-center">
          {/* 错误图标 */}
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-100 dark:bg-red-950/50 mb-6">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>

          {/* 标题 */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            出错了
          </h1>

          {/* 错误信息 */}
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            抱歉，应用程序遇到了一个错误。请尝试刷新页面或返回首页。
          </p>

          {/* 开发环境显示错误详情 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 rounded-lg bg-slate-100 dark:bg-slate-900 text-left">
              <p className="text-sm font-mono text-red-600 dark:text-red-400 break-words">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={reset}
              className="h-11 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              重试
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 px-6 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
            >
              <a href="/">
                <Home className="mr-2 h-4 w-4" />
                返回首页
              </a>
            </Button>
          </div>

          {/* 帮助链接 */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              如果问题持续存在，请{' '}
              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                联系支持
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
