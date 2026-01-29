import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
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

    const summary = await prisma.summary.findFirst({
      where: {
        id,
        userId: session.user.id
      }
    })

    if (!summary) {
      return NextResponse.json(
        { success: false, error: '记录不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        keywords: JSON.parse(summary.keywords),
        createdAt: summary.createdAt.toISOString()
      }
    })
  } catch (error) {
    console.error('History detail error:', error)
    return NextResponse.json(
      { success: false, error: '获取详情失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
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

    await prisma.summary.deleteMany({
      where: {
        id,
        userId: session.user.id
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('History delete error:', error)
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    )
  }
}
