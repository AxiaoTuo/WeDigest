'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { FileText, Clock, Settings, Home, Search, Sparkles } from 'lucide-react'

interface CommandItem {
  icon: React.ReactNode
  label: string
  description?: string
  action: () => void
  shortcut?: string
}

export function CommandPalette() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const commands: CommandItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: '返回首页',
      action: () => router.push('/'),
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: '开始使用',
      description: '生成新的深度研报',
      action: () => router.push('/app'),
      shortcut: '⌘N',
    },
    {
      icon: <Clock className="h-5 w-5" />,
      label: '历史记录',
      description: '查看所有生成的研报',
      action: () => router.push('/history'),
      shortcut: '⌘H',
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: '设置',
      description: '配置 API Keys',
      action: () => router.push('/settings'),
    },
  ]

  // 过滤命令
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description?.toLowerCase().includes(search.toLowerCase())
  )

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 执行命令并关闭
  const handleCommand = useCallback((command: CommandItem) => {
    command.action()
    setIsOpen(false)
    setSearch('')
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 gap-0 max-w-lg">
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4 py-3">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <Input
            placeholder="搜索命令..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 text-base"
            autoFocus
          />
          <kbd className="ml-3 px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">
            ESC
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center">
              <Sparkles className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">未找到相关命令</p>
            </div>
          ) : (
            <div className="px-2">
              {filteredCommands.map((cmd, index) => (
                <button
                  key={index}
                  onClick={() => handleCommand(cmd)}
                  className="w-full flex items-start gap-3 px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {cmd.label}
                    </p>
                    {cmd.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {cmd.description}
                      </p>
                    )}
                  </div>
                  {cmd.shortcut && (
                    <kbd className="px-2 py-1 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded shrink-0">
                      {cmd.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑↓</kbd>
              导航
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↵</kbd>
              选择
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">ESC</kbd>
              关闭
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
