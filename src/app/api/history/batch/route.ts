import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const { action, ids } = body

    if (!action || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '无效的参数' },
        { status: 400 }
      )
    }

    // 验证所有记录都属于当前用户
    const summaries = await prisma.summary.findMany({
      where: {
        id: { in: ids },
        userId: session.user.id
      },
      select: { id: true }
    })

    const validIds = summaries.map(s => s.id)

    if (action === 'delete') {
      // 批量删除
      await prisma.summary.deleteMany({
        where: {
          id: { in: validIds },
          userId: session.user.id
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          deleted: validIds.length
        }
      })
    }

    if (action === 'favorite') {
      // 批量收藏/取消收藏
      const { isFavorite } = body
      if (typeof isFavorite !== 'boolean') {
        return NextResponse.json(
          { success: false, error: '无效的参数' },
          { status: 400 }
        )
      }

      await prisma.summary.updateMany({
        where: {
          id: { in: validIds },
          userId: session.user.id
        },
        data: { isFavorite }
      })

      return NextResponse.json({
        success: true,
        data: {
          updated: validIds.length
        }
      })
    }

    if (action === 'export') {
      // 批量导出 - 返回所有记录的内容
      const summaries = await prisma.summary.findMany({
        where: {
          id: { in: validIds },
          userId: session.user.id
        },
        select: {
          id: true,
          articleTitle: true,
          articleUrl: true,
          articleAuthor: true,
          markdown: true,
          provider: true,
          createdAt: true
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          items: summaries.map(s => ({
            ...s,
            keywords: []
          }))
        }
      })
    }

    return NextResponse.json(
      { success: false, error: '不支持的操作' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Batch operation error:', error)
    return NextResponse.json(
      { success: false, error: '批量操作失败' },
      { status: 500 }
    )
  }
}
