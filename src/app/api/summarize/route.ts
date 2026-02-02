import { NextRequest } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'
import { getProvider } from '@/lib/ai-providers'
import { AIProviderType, SummaryOptions, StreamChunk } from '@/types/ai-provider'

const summarizeSchema = z.object({
  articleUrl: z.string().url(),
  content: z.string().min(1, '文章内容不能为空'),
  title: z.string(),
  author: z.string().optional(),
  provider: z.enum(['openai', 'deepseek', 'zhipu']),
  options: z.object({
    style: z.enum(['brief', 'detailed', 'bullet-points']),
    language: z.enum(['zh', 'en'])
  }),
  templateId: z.string().optional(),
  customPrompt: z.string().optional(),
  stream: z.boolean().optional().default(false)
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { articleUrl, content, title, author, provider, options, templateId, customPrompt, stream } = summarizeSchema.parse(body)

    // 获取模板 Prompt
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
          // 记录使用
          fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/prompt-templates/${templateId}/use`, {
            method: 'POST'
          }).catch(() => {})
        }
      }
    } else if (customPrompt) {
      customTemplate = customPrompt
    }

    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider
        }
      }
    })

    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return Response.json(
        { success: false, error: `请先配置 ${provider.toUpperCase()} 的 API Key` },
        { status: 400 }
      )
    }

    const apiKey = decrypt(apiKeyRecord.encryptedKey)
    const aiProvider = getProvider(provider as AIProviderType)

    // 流式输出
    if (stream) {
      const encoder = new TextEncoder()

      const stream = new ReadableStream({
        async start(controller) {
          let fullMarkdown = ''
          let summaryId: string | null = null

          try {
            const onChunk = (chunk: StreamChunk) => {
              if (!chunk.done) {
                fullMarkdown += chunk.content
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content, done: false })}\n\n`))
              } else {
                // 完成，保存到数据库
                const result = aiProvider.parseResponse(content, fullMarkdown)

                prisma.summary.create({
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
                }).then(summary => {
                  summaryId = summary.id
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, id: summary.id, result })}\n\n`))
                  controller.close()
                }).catch(err => {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: '保存失败', done: true })}\n\n`))
                  controller.close()
                })
              }
            }

            await aiProvider.summarizeStream(
              content,
              options as SummaryOptions,
              apiKey,
              onChunk,
              apiKeyRecord.baseUrl || undefined,
              apiKeyRecord.modelName || undefined,
              customTemplate
            )
          } catch (error) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'AI 总结失败', done: true })}\n\n`))
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // 非流式输出（原有逻辑）
    const result = await aiProvider.summarize(content, options as SummaryOptions, apiKey, apiKeyRecord.baseUrl || undefined, apiKeyRecord.modelName || undefined, customTemplate)

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

    return Response.json({
      success: true,
      data: {
        id: summary.id,
        result,
        createdAt: summary.createdAt.toISOString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Summarize error:', error)
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'AI 总结失败' },
      { status: 500 }
    )
  }
}
