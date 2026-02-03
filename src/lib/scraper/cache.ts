import { Article } from '@/types/article'

interface CacheEntry {
  article: Article
  timestamp: number
}

/**
 * In-memory cache for article scraping results
 * Helps avoid duplicate scraping of the same URLs
 */
class ArticleCache {
  private cache: Map<string, CacheEntry>
  private ttl: number // Time to live in milliseconds

  constructor(ttlMinutes: number = 30) {
    this.cache = new Map()
    this.ttl = ttlMinutes * 60 * 1000
  }

  /**
   * Generate a cache key from URL
   */
  private getKey(url: string): string {
    // Remove query parameters and fragment for better cache hits
    const urlObj = new URL(url)
    return `${urlObj.origin}${urlObj.pathname}`
  }

  /**
   * Check if URL is in cache and still valid
   */
  has(url: string): boolean {
    const key = this.getKey(url)
    const entry = this.cache.get(key)

    if (!entry) {
      return false
    }

    // Check if entry has expired
    const now = Date.now()
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * Get article from cache
   */
  get(url: string): Article | null {
    const key = this.getKey(url)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    const now = Date.now()
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.article
  }

  /**
   * Set article in cache
   */
  set(url: string, article: Article): void {
    const key = this.getKey(url)
    this.cache.set(key, {
      article,
      timestamp: Date.now()
    })
  }

  /**
   * Delete specific entry from cache
   */
  delete(url: string): boolean {
    const key = this.getKey(url)
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }
}

// Create a singleton instance with 30 minute TTL
export const articleCache = new ArticleCache(30)

// Periodic cleanup (every 10 minutes)
if (typeof window === 'undefined') {
  setInterval(() => {
    const removed = articleCache.cleanup()
    if (removed > 0) {
      console.log(`[ArticleCache] Cleaned up ${removed} expired entries`)
    }
  }, 10 * 60 * 1000)
}
