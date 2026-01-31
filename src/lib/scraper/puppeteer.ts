import type { Browser, Page } from 'puppeteer-core'

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    return browserInstance
  }

  if (process.env.NODE_ENV === 'production') {
    const puppeteer = await import('puppeteer-core')
    const chromium = await import('@sparticuz/chromium')

    // 优先使用环境变量指定的 Chromium (Docker 环境)
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH ||
                           process.env.CHROMIUM_PATH ||
                           await chromium.default.executablePath()

    browserInstance = await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ],
      executablePath,
      headless: true
    })
  } else {
    const puppeteer = await import('puppeteer')
    browserInstance = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  return browserInstance
}

export async function fetchPageContent(url: string): Promise<string> {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let browser: Browser | null = null
    let page: Page | null = null

    try {
      browser = await getBrowser()
      page = await browser.newPage()

      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      )

      await page.setViewport({ width: 1280, height: 800 })

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      })

      await page.waitForSelector('#js_content', { timeout: 10000 }).catch(() => {
        console.log('Waiting for content selector timed out, continuing...')
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      const content = await page.content()
      return content
    } catch (error) {
      lastError = error as Error
      console.error(`Fetch attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : error)

      // 如果是 Target closed 错误，重置浏览器实例
      if (error instanceof Error && error.message.includes('Target closed')) {
        await closeBrowser()
      }

      // 最后一次尝试失败，抛出错误
      if (attempt === maxRetries) {
        throw lastError
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    } finally {
      if (page) {
        try {
          await page.close()
        } catch {
          // 忽略关闭页面的错误
        }
      }
    }
  }

  throw lastError || new Error('Failed to fetch page content')
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
