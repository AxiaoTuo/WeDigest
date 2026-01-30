import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'
import { getProvider } from '@/lib/ai-providers'
import { AIProviderType, SummaryOptions } from '@/types/ai-provider'

const summarizeSchema = z.object({
  articleUrl: z.string().url(),
  content: z.string().min(1, '文章内容不能为空'),
  title: z.string(),
  author: z.string().optional(),
  provider: z.enum(['openai', 'deepseek', 'zhipu']),
  options: z.object({
    style: z.enum(['brief', 'detailed', 'bullet-points']),
    language: z.enum(['zh', 'en'])
  })
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { articleUrl, content, title, author, provider, options } = summarizeSchema.parse(body)

    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider
        }
      }
    })

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return NextResponse.json(
        { success: false, error: `请先配置 ${provider.toUpperCase()} 的 API Key` },
        { status: 400 }
      )
    }

    const apiKey = decrypt(apiKeyRecord.encryptedKey)
    const aiProvider = getProvider(provider as AIProviderType)

    const result = await aiProvider.summarize(content, options as SummaryOptions, apiKey, apiKeyRecord.baseUrl || undefined, apiKeyRecord.modelName || undefined)

    const summary = await prisma.summary.create({
      data: {
        userId: session.user.id,
        articleUrl,
        articleTitle: title || result.title,
        articleAuthor: author,
        originalContent: content,
        summary: result.summary,
        markdown: result.markdown,
        keywords: JSON.stringify(result.keywords),
        provider
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: summary.id,
        result,
        createdAt: summary.createdAt.toISOString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Summarize error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'AI 总结失败' },
      { status: 500 }
    )
  }
}
