'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutCallbacks {
  onCommandPalette?: () => void
  onFocusSearch?: () => void
  onNewNote?: () => void
  onGoToHistory?: () => void
  onCloseModal?: () => void
}

export function useKeyboardShortcuts(callbacks?: ShortcutCallbacks) {
  const router = useRouter()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 检查是否在输入框中
    const isInputFocused =
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement ||
      document.activeElement?.getAttribute('contenteditable') === 'true'

    // Cmd/Ctrl + K - 打开命令面板
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      callbacks?.onCommandPalette?.()
      return
    }

    // Cmd/Ctrl + / - 聚焦搜索框
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault()
      callbacks?.onFocusSearch?.()
      return
    }

    // Cmd/Ctrl + N - 新建笔记
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault()
      callbacks?.onNewNote?.()
      return
    }

    // Cmd/Ctrl + H - 跳转历史
    if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
      e.preventDefault()
      callbacks?.onGoToHistory?.()
      return
    }

    // Escape - 关闭弹窗
    if (e.key === 'Escape' && !isInputFocused) {
      callbacks?.onCloseModal?.()
      return
    }
  }, [callbacks])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}
