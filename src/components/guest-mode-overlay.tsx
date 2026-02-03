'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LogIn, UserPlus, Sparkles, Lock, BookOpen, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuestModeOverlayProps {
  className?: string
}

export function GuestModeOverlay({ className }: GuestModeOverlayProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm',
        className
      )}
    >
      <Card className="max-w-md w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-2xl border-slate-200 dark:border-slate-800">
        <CardContent className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Lock className="h-8 w-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center mb-3">
            登录以继续使用
          </h2>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-400 text-center mb-8 leading-relaxed">
            WeDigest 需要您登录后才能生成深度研报。登录后您可以:
          </p>

          {/* Features List */}
          <div className="space-y-3 mb-8">
            {[
              { icon: <BookOpen className="h-4 w-4" />, text: '生成 AI 深度研报级学习笔记' },
              { icon: <Sparkles className="h-4 w-4" />, text: '保存历史记录，随时查看' },
              { icon: <Lock className="h-4 w-4" />, text: 'API Key 加密存储，安全可靠' }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
              >
                <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <LogIn className="mr-2 h-4 w-4" />
              立即登录
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => router.push('/login')}
              variant="outline"
              className="w-full h-12 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all duration-300"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              注册新账号
            </Button>
          </div>

          {/* Bottom Note */}
          <p className="text-xs text-slate-500 dark:text-slate-500 text-center mt-6">
            完全免费使用 · 无需信用卡 · 随时导出数据
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Compact version for inline use
export function GuestModeCompact({ className }: GuestModeOverlayProps) {
  const router = useRouter()

  return (
    <div
      className={cn(
        'rounded-xl p-6 text-center',
        'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50',
        'border-2 border-dashed border-indigo-200 dark:border-indigo-800',
        className
      )}
    >
      <div className="flex justify-center mb-4">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
          <Lock className="h-6 w-6 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        登录后使用此功能
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-xs mx-auto">
        请先登录以生成深度研报和保存历史记录
      </p>
      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => router.push('/login')}
          size="sm"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
        >
          <LogIn className="mr-2 h-3 w-3" />
          登录
        </Button>
        <Button
          onClick={() => router.push('/login')}
          size="sm"
          variant="outline"
          className="border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          注册
        </Button>
      </div>
    </div>
  )
}
