import { fetchPageContent } from './puppeteer'
import { parseWechatArticle } from './parser'
import type { ParsedArticle } from './parser'
import { Article } from '@/types/article'
import { articleCache } from './cache'

const WECHAT_ARTICLE_PATTERN = /^https?:\/\/mp\.weixin\.qq\.com\/s/

export function isValidWechatUrl(url: string): boolean {
  return WECHAT_ARTICLE_PATTERN.test(url)
}

export async function fetchArticle(url: string, useCache: boolean = true): Promise<Article> {
  if (!isValidWechatUrl(url)) {
    throw new Error('请输入有效的微信公众号文章链接')
  }

  // Check cache first
  if (useCache) {
    const cached = articleCache.get(url)
    if (cached) {
      console.log(`[Scraper] Cache hit for URL: ${url}`)
      return cached
    }
  }

  // Fetch and parse article
  const html = await fetchPageContent(url)
  const parsed: ParsedArticle = parseWechatArticle(html)

  const article: Article = {
    url,
    title: parsed.title,
    author: parsed.author,
    publishTime: parsed.publishTime,
    content: parsed.content,
    images: parsed.images,
    wordCount: parsed.wordCount
  }

  // Cache the result
  if (useCache) {
    articleCache.set(url, article)
    console.log(`[Scraper] Cached article: ${url}`)
  }

  return article
}

/**
 * Clear the article cache
 */
export function clearArticleCache(): void {
  articleCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return articleCache.getStats()
}

/**
 * Force cleanup of expired cache entries
 */
export function cleanupCache(): number {
  return articleCache.cleanup()
}

export type { ParsedArticle }
