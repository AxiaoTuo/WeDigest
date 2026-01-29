import { fetchPageContent } from './puppeteer'
import { parseWechatArticle } from './parser'
import type { ParsedArticle } from './parser'
import { Article } from '@/types/article'

const WECHAT_ARTICLE_PATTERN = /^https?:\/\/mp\.weixin\.qq\.com\/s/

export function isValidWechatUrl(url: string): boolean {
  return WECHAT_ARTICLE_PATTERN.test(url)
}

export async function fetchArticle(url: string): Promise<Article> {
  if (!isValidWechatUrl(url)) {
    throw new Error('请输入有效的微信公众号文章链接')
  }

  const html = await fetchPageContent(url)
  const parsed: ParsedArticle = parseWechatArticle(html)

  return {
    url,
    title: parsed.title,
    author: parsed.author,
    publishTime: parsed.publishTime,
    content: parsed.content,
    images: parsed.images,
    wordCount: parsed.wordCount
  }
}

export type { ParsedArticle }
