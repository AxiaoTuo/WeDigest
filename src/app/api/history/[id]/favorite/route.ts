import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { isFavorite } = body

    if (typeof isFavorite !== 'boolean') {
      return NextResponse.json(
        { success: false, error: '无效的参数' },
        { status: 400 }
      )
    }

    // 验证记录属于当前用户
    const summary = await prisma.summary.findUnique({
      where: { id }
    })

    if (!summary) {
      return NextResponse.json(
        { success: false, error: '记录不存在' },
        { status: 404 }
      )
    }

    if (summary.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      )
    }

    // 更新收藏状态
    const updated = await prisma.summary.update({
      where: { id },
      data: { isFavorite }
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        isFavorite: updated.isFavorite
      }
    })
  } catch (error) {
    console.error('Toggle favorite error:', error)
    return NextResponse.json(
      { success: false, error: '操作失败' },
      { status: 500 }
    )
  }
}
