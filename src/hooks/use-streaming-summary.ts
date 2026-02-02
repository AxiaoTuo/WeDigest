import { useState, useCallback, useRef } from 'react'
import { SummaryResult } from '@/types/ai-provider'

interface StreamingSummaryOptions {
  onChunk?: (content: string) => void
  onComplete?: (result: SummaryResult, id: string) => void
  onError?: (error: string) => void
}

export function useStreamingSummary() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const startStreaming = useCallback(async (
    articleUrl: string,
    content: string,
    title: string,
    author: string | undefined,
    provider: string,
    options: { style: string; language: string },
    templateId?: string,
    streamingOptions?: StreamingSummaryOptions
  ) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsStreaming(true)
    setStreamedContent('')

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleUrl,
          content,
          title,
          author,
          provider,
          options,
          templateId,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '请求失败')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法获取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (!data) continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.error) {
                streamingOptions?.onError?.(parsed.error)
                setIsStreaming(false)
                return
              }

              if (parsed.done) {
                streamingOptions?.onComplete?.(parsed.result, parsed.id)
                setIsStreaming(false)
                return
              }

              if (parsed.content) {
                setStreamedContent(prev => {
                  const newContent = prev + parsed.content
                  streamingOptions?.onChunk?.(newContent)
                  return newContent
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('请求已取消')
      } else {
        const errorMessage = error instanceof Error ? error.message : '未知错误'
        streamingOptions?.onError?.(errorMessage)
      }
      setIsStreaming(false)
    }
  }, [])

  const cancelStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const resetStreaming = useCallback(() => {
    setStreamedContent('')
    setIsStreaming(false)
  }, [])

  return {
    isStreaming,
    streamedContent,
    startStreaming,
    cancelStreaming,
    resetStreaming
  }
}
