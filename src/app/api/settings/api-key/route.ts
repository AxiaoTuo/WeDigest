import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/crypto'

const saveKeySchema = z.object({
  provider: z.enum(['openai', 'deepseek', 'zhipu']),
  apiKey: z.string().min(1, 'API Key 不能为空'),
  baseUrl: z.string().optional(),
  modelName: z.string().optional()
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
    const { provider, apiKey, baseUrl, modelName } = saveKeySchema.parse(body)

    const encryptedKey = encrypt(apiKey)

    await prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider
        }
      },
      update: {
        encryptedKey,
        baseUrl,
        modelName,
        isActive: true
      },
      create: {
        userId: session.user.id,
        provider,
        encryptedKey,
        baseUrl,
        modelName,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'API Key 已保存'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Save API key error:', error)
    return NextResponse.json(
      { success: false, error: '保存失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (provider) {
      const key = await prisma.apiKey.findUnique({
        where: {
          userId_provider: {
            userId: session.user.id,
            provider
          }
        }
      })

      if (!key) {
        return NextResponse.json({
          success: true,
          data: null
        })
      }

      return NextResponse.json({
        success: true,
        data: {
          provider: key.provider,
          isActive: key.isActive,
          baseUrl: key.baseUrl,
          modelName: key.modelName,
          createdAt: key.createdAt.toISOString(),
          decryptedKey: decrypt(key.encryptedKey)
        }
      })
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        provider: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: keys.map(key => ({
        ...key,
        createdAt: key.createdAt.toISOString()
      }))
    })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { success: false, error: '缺少 provider 参数' },
        { status: 400 }
      )
    }

    await prisma.apiKey.deleteMany({
      where: {
        userId: session.user.id,
        provider
      }
    })

    return NextResponse.json({
      success: true,
      message: 'API Key 已删除'
    })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    )
  }
}
