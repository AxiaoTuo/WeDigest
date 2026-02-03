import type { Browser, Page } from 'puppeteer-core'

/**
 * Puppeteer configuration and connection pooling
 */

interface BrowserPoolEntry {
  browser: Browser
  pageCount: number
  maxPages: number
  createdAt: number
}

// Configuration
const CONFIG = {
  MAX_BROWSERS: parseInt(process.env.PUPPETEER_MAX_BROWSERS || '2', 10),
  MAX_PAGES_PER_BROWSER: parseInt(process.env.PUPPETEER_MAX_PAGES || '5', 10),
  BROWSER_IDLE_TIMEOUT: parseInt(process.env.PUPPETEER_IDLE_TIMEOUT || '300000', 10), // 5 minutes
  PAGE_TIMEOUT: parseInt(process.env.PUPPETEER_PAGE_TIMEOUT || '30000', 10),
  MAX_RETRIES: parseInt(process.env.PUPPETEER_MAX_RETRIES || '3', 10),
  RETRY_DELAY: parseInt(process.env.PUPPETEER_RETRY_DELAY || '1000', 10)
}

// Browser pool
const browserPool: BrowserPoolEntry[] = []
let requestQueue: Array<() => void> = []
let isProcessingQueue = false

/**
 * Get the least busy browser from the pool
 */
function getLeastBusyBrowserEntry(): BrowserPoolEntry | null {
  if (browserPool.length === 0) {
    return null
  }

  // Sort by page count (ascending) and return the first one
  return browserPool.reduce((min, current) =>
    current.pageCount < min.pageCount ? current : min
  )
}

/**
 * Create a new browser instance
 */
async function createBrowser(): Promise<Browser> {
  const puppeteer = await import('puppeteer-core')

  if (process.env.NODE_ENV === 'production') {
    const chromium = await import('@sparticuz/chromium')

    // 优先使用环境变量指定的 Chromium (Docker 环境)
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
                           process.env.CHROMIUM_PATH ||
                           await chromium.default.executablePath()

    return await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-blink-features=AutomationControlled'
      ],
      executablePath,
      headless: true
    })
  } else {
    return await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    })
  }
}

/**
 * Get or create a browser from the pool
 */
async function getBrowser(): Promise<Browser> {
  // Try to get an existing browser with available capacity
  let entry = getLeastBusyBrowserEntry()

  if (entry && entry.pageCount < entry.maxPages) {
    return entry.browser
  }

  // Create new browser if under limit
  if (browserPool.length < CONFIG.MAX_BROWSERS) {
    const browser = await createBrowser()
    const newEntry: BrowserPoolEntry = {
      browser,
      pageCount: 0,
      maxPages: CONFIG.MAX_PAGES_PER_BROWSER,
      createdAt: Date.now()
    }
    browserPool.push(newEntry)
    console.log(`[Puppeteer] Created new browser (pool size: ${browserPool.length}/${CONFIG.MAX_BROWSERS})`)
    return browser
  }

  // Wait for an available browser
  return new Promise((resolve) => {
    requestQueue.push(() => {
      const availableEntry = getLeastBusyBrowserEntry()
      if (availableEntry) {
        resolve(availableEntry.browser)
      }
    })
  })
}

/**
 * Increment page count for a browser
 */
function incrementPageCount(browser: Browser): void {
  const entry = browserPool.find(e => e.browser === browser)
  if (entry) {
    entry.pageCount++
  }
}

/**
 * Decrement page count for a browser
 */
function decrementPageCount(browser: Browser): void {
  const entry = browserPool.find(e => e.browser === browser)
  if (entry) {
    entry.pageCount = Math.max(0, entry.pageCount - 1)

    // Process queued requests if space is available
    if (entry.pageCount < entry.maxPages && requestQueue.length > 0) {
      processRequestQueue()
    }
  }
}

/**
 * Process the request queue
 */
async function processRequestQueue(): Promise<void> {
  if (isProcessingQueue || requestQueue.length === 0) {
    return
  }

  isProcessingQueue = true

  while (requestQueue.length > 0) {
    const entry = getLeastBusyBrowserEntry()
    if (entry && entry.pageCount < entry.maxPages) {
      const callback = requestQueue.shift()
      callback?.()
    } else {
      break
    }
  }

  isProcessingQueue = false
}

/**
 * Cleanup idle browsers
 */
function cleanupIdleBrowsers(): void {
  const now = Date.now()
  const toRemove: Browser[] = []

  for (const entry of browserPool) {
    // Remove browsers that are idle (no pages) and past timeout
    if (entry.pageCount === 0 && now - entry.createdAt > CONFIG.BROWSER_IDLE_TIMEOUT) {
      toRemove.push(entry.browser)
    }
  }

  for (const browser of toRemove) {
    const index = browserPool.findIndex(e => e.browser === browser)
    if (index !== -1) {
      browserPool.splice(index, 1)
      browser.close().catch(console.error)
      console.log(`[Puppeteer] Closed idle browser (pool size: ${browserPool.length})`)
    }
  }
}

// Periodic cleanup (every minute)
if (typeof window === 'undefined') {
  setInterval(cleanupIdleBrowsers, 60000)
}

/**
 * Fetch page content with connection pooling
 */
export async function fetchPageContent(url: string): Promise<string> {
  let browser: Browser | null = null
  let page: Page | null = null
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= CONFIG.MAX_RETRIES; attempt++) {
    try {
      browser = await getBrowser()
      incrementPageCount(browser)

      page = await browser.newPage()

      // Set user agent to avoid detection
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      // Set viewport
      await page.setViewport({ width: 1280, height: 800 })

      // Navigate to URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.PAGE_TIMEOUT
      })

      // Wait for content selector
      await page.waitForSelector('#js_content', { timeout: 10000 }).catch(() => {
        console.log('[Puppeteer] Content selector not found, continuing...')
      })

      // Small delay for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Get content
      const content = await page.content()

      return content
    } catch (error) {
      lastError = error as Error
      console.error(`[Puppeteer] Fetch attempt ${attempt}/${CONFIG.MAX_RETRIES} failed:`, error instanceof Error ? error.message : error)

      // If browser crashed, remove it from pool
      if (error instanceof Error && (
        error.message.includes('Target closed') ||
        error.message.includes('Session closed') ||
        error.message.includes('not connected to browser')
      )) {
        if (browser) {
          const index = browserPool.findIndex(e => e.browser === browser)
          if (index !== -1) {
            browserPool.splice(index, 1)
          }
        }
        browser = null
      }

      // Last attempt failed, throw error
      if (attempt === CONFIG.MAX_RETRIES) {
        throw lastError
      }

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt))
    } finally {
      if (page && browser) {
        try {
          await page.close()
          decrementPageCount(browser)
        } catch {
          // Page might already be closed
          if (browser) {
            decrementPageCount(browser)
          }
        }
      }
    }
  }

  throw lastError || new Error('Failed to fetch page content')
}

/**
 * Close all browsers in the pool
 */
export async function closeBrowser(): Promise<void> {
  // Clear request queue
  requestQueue = []

  // Close all browsers
  const closePromises = browserPool.map(async (entry) => {
    try {
      await entry.browser.close()
    } catch (error) {
      console.error('[Puppeteer] Error closing browser:', error)
    }
  })

  await Promise.all(closePromises)
  browserPool.length = 0

  console.log('[Puppeteer] All browsers closed')
}

/**
 * Get pool statistics
 */
export function getPoolStats(): {
  poolSize: number
  maxBrowsers: number
  maxPagesPerBrowser: number
  queuedRequests: number
  pagesInUse: number
} {
  return {
    poolSize: browserPool.length,
    maxBrowsers: CONFIG.MAX_BROWSERS,
    maxPagesPerBrowser: CONFIG.MAX_PAGES_PER_BROWSER,
    queuedRequests: requestQueue.length,
    pagesInUse: browserPool.reduce((sum, entry) => sum + entry.pageCount, 0)
  }
}
