import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'
import { getProvider } from '@/lib/ai-providers'
import { AIProviderType, SummaryOptions } from '@/types/ai-provider'

const compareSchema = z.object({
  articleUrl: z.string().url(),
  content: z.string().min(1, '文章内容不能为空'),
  title: z.string(),
  author: z.string().optional(),
  providers: z.array(z.enum(['openai', 'deepseek', 'zhipu'])).min(2).max(3),
  options: z.object({
    style: z.enum(['brief', 'detailed', 'bullet-points']),
    language: z.enum(['zh', 'en'])
  }),
  templateId: z.string().optional()
})

interface ComparisonResult {
  provider: string
  success: boolean
  result?: any
  error?: string
  duration: number
}

// POST /api/summarize/compare - 多模型对比
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
    const { articleUrl, content, title, author, providers, options, templateId } = compareSchema.parse(body)

    // 获取自定义模板
    let customTemplate: string | undefined
    if (templateId) {
      if (templateId.startsWith('preset_')) {
        const { PRESET_TEMPLATES } = await import('@/lib/prompts/presets')
        const presetName = templateId.replace('preset_', '')
        const preset = PRESET_TEMPLATES.find(t => t.name === presetName)
        if (preset) {
          customTemplate = preset.prompt
        }
      } else {
        const template = await prisma.promptTemplate.findFirst({
          where: {
            id: templateId,
            OR: [
              { userId: session.user.id },
              { isSystem: true }
            ]
          }
        })
        if (template) {
          customTemplate = template.prompt
        }
      }
    }

    // 验证所有 provider 的 API key 都存在
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
        provider: { in: providers },
        isActive: true
      }
    })

    const availableProviders = apiKeys.map(k => k.provider)
    const missingProviders = providers.filter(p => !availableProviders.includes(p))

    if (missingProviders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `以下 AI 供应商未配置 API Key: ${missingProviders.map(p => p.toUpperCase()).join(', ')}`
        },
        { status: 400 }
      )
    }

    // 并行请求多个模型
    const results: ComparisonResult[] = await Promise.all(
      providers.map(async (provider) => {
        const startTime = Date.now()

        try {
          const apiKeyRecord = apiKeys.find(k => k.provider === provider)!
          const apiKey = decrypt(apiKeyRecord.encryptedKey)
          const aiProvider = getProvider(provider as AIProviderType)

          const result = await aiProvider.summarize(
            content,
            options as SummaryOptions,
            apiKey,
            apiKeyRecord.baseUrl || undefined,
            apiKeyRecord.modelName || undefined,
            customTemplate
          )

          const duration = Date.now() - startTime

          return {
            provider,
            success: true,
            result,
            duration
          }
        } catch (error) {
          const duration = Date.now() - startTime
          return {
            provider,
            success: false,
            error: error instanceof Error ? error.message : '请求失败',
            duration
          }
        }
      })
    )

    // 统计信息
    const successCount = results.filter(r => r.success).length
    const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
    const avgLength = successCount > 0
      ? Math.round(results
          .filter(r => r.success)
          .reduce((sum, r) => sum + r.result.markdown.length, 0) / successCount)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        articleUrl,
        articleTitle: title,
        articleAuthor: author,
        originalContent: content,
        results,
        stats: {
          successCount,
          totalCount: results.length,
          avgDuration,
          avgLength
        }
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Compare error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '对比失败' },
      { status: 500 }
    )
  }
}
