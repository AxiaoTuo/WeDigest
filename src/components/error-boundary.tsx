'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // TODO: 上报错误到监控服务
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // 使用自定义 fallback 或默认错误 UI
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorUI error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

/**
 * 默认错误 UI
 */
function DefaultErrorUI({ error, resetError }: { error: Error; resetError: () => void }) {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-2 border-red-200 dark:border-red-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">出错了</CardTitle>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            抱歉，页面遇到了一些问题
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 开发环境显示错误详情 */}
          {process.env.NODE_ENV === 'development' && (
            <details className="bg-slate-100 dark:bg-slate-900 rounded-lg p-4">
              <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                错误详情
              </summary>
              <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto mt-2 whitespace-pre-wrap">
                {error.stack || error.message}
              </pre>
            </details>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={resetError}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              重试
            </Button>
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              首页
            </Button>
          </div>

          {/* 建议文案 */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            如果问题持续存在，请尝试刷新页面或联系支持
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * React Hook 版本的错误边界
 */
export function useErrorHandler() {
  return (error: Error) => {
    throw error
  }
}
