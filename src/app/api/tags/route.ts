import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface TagStats {
  tag: string
  count: number
  recent?: string[]
}

// GET /api/tags - 获取用户标签统计
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const includeRecent = searchParams.get('includeRecent') === 'true'

    // 获取所有摘要记录
    const summaries = await prisma.summary.findMany({
      where: { userId: session.user.id },
      select: {
        keywords: true,
        articleTitle: true,
        id: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // 统计标签
    const tagMap = new Map<string, { count: number; recent: Array<{ title: string; id: string; date: string }> }>()

    for (const summary of summaries) {
      try {
        const keywords = JSON.parse(summary.keywords)
        for (const keyword of keywords) {
          if (!tagMap.has(keyword)) {
            tagMap.set(keyword, { count: 0, recent: [] })
          }
          const stats = tagMap.get(keyword)!
          stats.count++

          if (includeRecent && stats.recent.length < 5) {
            stats.recent.push({
              title: summary.articleTitle,
              id: summary.id,
              date: summary.createdAt.toISOString()
            })
          }
        }
      } catch (e) {
        // Skip invalid keywords
      }
    }

    // 转换为数组并排序
    const tagStats: TagStats[] = Array.from(tagMap.entries())
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        recent: includeRecent ? stats.recent.map(r => `${r.title}`).slice(0, 3) : undefined
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: tagStats
    })
  } catch (error) {
    console.error('Get tags error:', error)
    return NextResponse.json(
      { success: false, error: '获取标签失败' },
      { status: 500 }
    )
  }
}
