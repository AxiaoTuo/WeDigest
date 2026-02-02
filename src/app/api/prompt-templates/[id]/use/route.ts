import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/prompt-templates/[id]/use - 记录模板使用
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = params

    // 预设模板不需要记录使用次数
    if (id.startsWith('preset_')) {
      return NextResponse.json({ success: true })
    }

    // 验证模板存在
    const template = await prisma.promptTemplate.findFirst({
      where: {
        id,
        OR: [
          { userId: session.user.id },
          { isSystem: true }
        ]
      }
    })

    if (!template) {
      return NextResponse.json(
        { success: false, error: '模板不存在' },
        { status: 404 }
      )
    }

    // 增加使用次数
    await prisma.promptTemplate.update({
      where: { id },
      data: {
        usageCount: { increment: 1 }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Use template error:', error)
    return NextResponse.json(
      { success: false, error: '记录使用失败' },
      { status: 500 }
    )
  }
}
