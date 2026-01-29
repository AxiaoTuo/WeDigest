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
    const summaryId = searchParams.get('summaryId')

    if (!summaryId) {
      return NextResponse.json(
        { success: false, error: '缺少 summaryId 参数' },
        { status: 400 }
      )
    }

    const summary = await prisma.summary.findFirst({
      where: {
        id: summaryId,
        userId: session.user.id
      }
    })

    if (!summary) {
      return NextResponse.json(
        { success: false, error: '记录不存在' },
        { status: 404 }
      )
    }

    const filename = `${summary.articleTitle.replace(/[<>:"/\\|?*]/g, '_')}.md`
    const content = summary.markdown

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { success: false, error: '导出失败' },
      { status: 500 }
    )
  }
}
