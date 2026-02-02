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

    // 搜索和筛选参数
    const search = searchParams.get('search') || ''
    const provider = searchParams.get('provider')
    const favorite = searchParams.get('favorite')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 构建查询条件
    const where: any = { userId: session.user.id }

    // 搜索：标题或作者模糊匹配
    if (search) {
      where.OR = [
        { articleTitle: { contains: search } },
        { articleAuthor: { contains: search } }
      ]
    }

    // 供应商筛选
    if (provider) {
      where.provider = provider
    }

    // 收藏筛选
    if (favorite === 'true') {
      where.isFavorite = true
    } else if (favorite === 'false') {
      where.isFavorite = false
    }

    // 日期范围筛选
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // 构建排序
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [items, total] = await Promise.all([
      prisma.summary.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          articleUrl: true,
          articleTitle: true,
          articleAuthor: true,
          keywords: true,
          provider: true,
          isFavorite: true,
          createdAt: true
        }
      }),
      prisma.summary.count({ where })
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
