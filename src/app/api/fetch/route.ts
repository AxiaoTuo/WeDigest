import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { fetchArticle, isValidWechatUrl } from '@/lib/scraper'

const fetchSchema = z.object({
  url: z.string().url('请输入有效的URL'),
  stream: z.boolean().optional().default(false)
})

/**
 * SSE helper function to send events
 */
function sendSSE(
  controller: ReadableStreamDefaultController<Uint8Array>,
  event: string,
  data: any
) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  controller.enqueue(new TextEncoder().encode(message))
}

/**
 * Enhanced fetch API with SSE support for progress updates
 */
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return Response.json(
      { success: false, error: '请先登录' },
      { status: 401 }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, error: '无效的请求体' },
      { status: 400 }
    )
  }

  const parsed = fetchSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const { url, stream } = parsed.data

  if (!isValidWechatUrl(url)) {
    return Response.json(
      { success: false, error: '请输入有效的微信公众号文章链接' },
      { status: 400 }
    )
  }

  // Regular JSON response (non-streaming)
  if (!stream) {
    try {
      const article = await fetchArticle(url)
      return Response.json({
        success: true,
        data: { article }
      })
    } catch (error) {
      console.error('Fetch error:', error)
      return Response.json(
        { success: false, error: error instanceof Error ? error.message : '抓取文章失败' },
        { status: 500 }
      )
    }
  }

  // SSE streaming response
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Send initial event
        sendSSE(controller, 'progress', { step: 'validate', message: '验证链接格式...', progress: 10 })

        // Validate URL
        try {
          new URL(url)
        } catch {
          sendSSE(controller, 'error', { message: '请输入有效的 URL' })
          controller.close()
          return
        }

        await new Promise(resolve => setTimeout(resolve, 300))

        // Check if it's a valid WeChat URL
        if (!isValidWechatUrl(url)) {
          sendSSE(controller, 'error', { message: '请输入有效的微信公众号文章链接' })
          controller.close()
          return
        }

        sendSSE(controller, 'progress', { step: 'validate', message: '链接验证通过', progress: 20 })

        await new Promise(resolve => setTimeout(resolve, 300))

        // Start fetching
        sendSSE(controller, 'progress', { step: 'fetch', message: '正在启动浏览器...', progress: 30 })

        // Fetch article with progress callbacks
        const article = await fetchArticleWithProgress(url, (step, message, progress) => {
          sendSSE(controller, 'progress', { step, message, progress })
        })

        sendSSE(controller, 'progress', { step: 'complete', message: '文章抓取完成', progress: 100 })

        // Send final result
        sendSSE(controller, 'complete', { article })

        await new Promise(resolve => setTimeout(resolve, 100))
        controller.close()
      } catch (error) {
        console.error('Fetch error:', error)
        sendSSE(controller, 'error', { message: error instanceof Error ? error.message : '抓取文章失败' })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}

/**
 * Fetch article with progress callbacks
 */
async function fetchArticleWithProgress(
  url: string,
  onProgress: (step: string, message: string, progress: number) => void
) {
  const { fetchPageContent } = await import('@/lib/scraper/puppeteer')
  const { parseWechatArticle } = await import('@/lib/scraper/parser')
  const { Article } = await import('@/types/article')

  onProgress('fetch', '正在连接到目标网站...', 40)

  // Simulate browser startup time
  await new Promise(resolve => setTimeout(resolve, 500))

  onProgress('fetch', '正在加载页面内容...', 50)

  const html = await fetchPageContent(url)

  onProgress('parse', '正在解析文章内容...', 80)

  await new Promise(resolve => setTimeout(resolve, 200))

  const parsed = parseWechatArticle(html)

  onProgress('parse', '正在处理文章数据...', 90)

  const article: Article = {
    url,
    title: parsed.title,
    author: parsed.author,
    publishTime: parsed.publishTime,
    content: parsed.content,
    images: parsed.images,
    wordCount: parsed.wordCount
  }

  return article
}
