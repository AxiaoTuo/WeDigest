'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 记录严重错误到错误报告服务
    console.error('Global application error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center px-6">
          <Card className="max-w-md w-full border-2 border-red-300 dark:border-red-800 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8 md:p-10 text-center">
              {/* 严重错误图标 */}
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/50 mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>

              {/* 标题 */}
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                严重错误
              </h1>

              {/* 错误信息 */}
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                应用程序遇到了一个严重错误。请刷新页面重新开始。
              </p>

              {/* 开发环境显示错误详情 */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-left">
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

              {/* 重试按钮 */}
              <Button
                onClick={() => window.location.reload()}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                刷新页面
              </Button>

              {/* 额外信息 */}
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
                如果此问题持续存在，请清除浏览器缓存后重试
              </p>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}
