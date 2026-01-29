import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth'
import { fetchArticle, isValidWechatUrl } from '@/lib/scraper'

const fetchSchema = z.object({
  url: z.string().url('请输入有效的URL')
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { url } = fetchSchema.parse(body)

    if (!isValidWechatUrl(url)) {
      return NextResponse.json(
        { success: false, error: '请输入有效的微信公众号文章链接' },
        { status: 400 }
      )
    }

    const article = await fetchArticle(url)

    return NextResponse.json({
      success: true,
      data: { article }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0].message },
        { status: 400 }
      )
    }

    console.error('Fetch error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '抓取文章失败' },
      { status: 500 }
    )
  }
}
