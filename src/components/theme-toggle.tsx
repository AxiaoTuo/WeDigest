'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // 避免水合不匹配
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative h-10 w-10 rounded-xl bg-white/80 backdrop-blur-md border border-slate-200 shadow-sm cursor-pointer"
        aria-label="加载主题切换"
      >
        <Sun className="h-5 w-5 text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </button>
    )
  }

  const themes = [
    { value: 'light', icon: Sun, label: '亮色模式' },
    { value: 'system', icon: Monitor, label: '跟随系统' },
    { value: 'dark', icon: Moon, label: '暗色模式' },
  ]

  const currentIndex = themes.findIndex(t => t.value === theme)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  const CurrentIcon = themes[currentIndex]?.icon || Sun

  return (
    <button
      onClick={() => setTheme(nextTheme.value)}
      className="group relative h-10 w-10 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
      aria-label={themes[currentIndex]?.label || '切换主题'}
    >
      <CurrentIcon className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors duration-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        {themes[currentIndex]?.label}
      </span>
    </button>
  )
}
