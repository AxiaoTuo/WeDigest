import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { exportToJson, exportToHtml, exportToNotion } from '@/lib/export/formats'

type ExportFormat = 'md' | 'json' | 'html' | 'notion'

function getContentType(format: ExportFormat): string {
  const types = {
    md: 'text/markdown; charset=utf-8',
    json: 'application/json; charset=utf-8',
    html: 'text/html; charset=utf-8',
    notion: 'text/markdown; charset=utf-8'
  }
  return types[format] || types.md
}

function getFileExtension(format: ExportFormat): string {
  const exts = {
    md: 'md',
    json: 'json',
    html: 'html',
    notion: 'md'
  }
  return exts[format] || exts.md
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
    const summaryId = searchParams.get('summaryId')
    const format = (searchParams.get('format') || 'md') as ExportFormat

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

    const detail: HistoryDetail = {
      id: summary.id,
      articleUrl: summary.articleUrl,
      articleTitle: summary.articleTitle,
      articleAuthor: summary.articleAuthor || undefined,
      keywords: JSON.parse(summary.keywords),
      provider: summary.provider,
      isFavorite: summary.isFavorite,
      originalContent: summary.originalContent,
      summary: summary.summary,
      markdown: summary.markdown,
      createdAt: summary.createdAt.toISOString()
    }

    let content: string
    let filename: string

    switch (format) {
      case 'json':
        content = exportToJson(detail)
        filename = `${detail.articleTitle.replace(/[<>:"/\\|?*]/g, '_')}.json`
        break
      case 'html':
        content = exportToHtml(detail)
        filename = `${detail.articleTitle.replace(/[<>:"/\\|?*]/g, '_')}.html`
        break
      case 'notion':
        content = exportToNotion(detail)
        filename = `${detail.articleTitle.replace(/[<>:"/\\|?*]/g, '_')}.md`
        break
      case 'md':
      default:
        content = detail.markdown
        filename = `${detail.articleTitle.replace(/[<>:"/\\|?*]/g, '_')}.md`
        break
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': getContentType(format),
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
