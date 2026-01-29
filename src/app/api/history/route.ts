import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      prisma.summary.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          articleUrl: true,
          articleTitle: true,
          articleAuthor: true,
          keywords: true,
          provider: true,
          createdAt: true
        }
      }),
      prisma.summary.count({ where: { userId: session.user.id } })
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: items.map(item => ({
          ...item,
          keywords: JSON.parse(item.keywords),
          createdAt: item.createdAt.toISOString()
        })),
        total,
        page,
        limit
      }
    })
  } catch (error) {
    console.error('History list error:', error)
    return NextResponse.json(
      { success: false, error: '获取历史记录失败' },
      { status: 500 }
    )
  }
}
