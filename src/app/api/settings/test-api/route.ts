import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { decrypt } from '@/lib/crypto'
import { getProvider } from '@/lib/ai-providers'
import { AIProviderType } from '@/types/ai-provider'

const testSchema = z.object({
  provider: z.enum(['openai', 'deepseek', 'zhipu'])
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
    const { provider } = testSchema.parse(body)

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
        { success: false, error: `未找到 ${provider.toUpperCase()} 的 API Key` },
        { status: 404 }
      )
    }

    const apiKey = decrypt(apiKeyRecord.encryptedKey)
    const aiProvider = getProvider(provider as AIProviderType)

    const testContent = '请回复 "测试成功"'
    const testOptions = { style: 'brief' as const, language: 'zh' as const }

    console.log(`[测试] 测试 ${provider} API 连接...`)
    console.log(`[测试] baseUrl: ${apiKeyRecord.baseUrl || 'default'}`)
    console.log(`[测试] modelName: ${apiKeyRecord.modelName || 'default'}`)

    const result = await aiProvider.summarize(
      testContent,
      testOptions,
      apiKey,
      apiKeyRecord.baseUrl || undefined,
      apiKeyRecord.modelName || undefined
    )

    return NextResponse.json({
      success: true,
      message: 'API 连接测试成功',
      data: {
        provider,
        baseUrl: apiKeyRecord.baseUrl,
        modelName: apiKeyRecord.modelName,
        response: result.summary
      }
    })
  } catch (error) {
    console.error('测试 API 连接失败:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'API 连接测试失败',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
