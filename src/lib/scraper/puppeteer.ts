import type { Browser, Page } from 'puppeteer-core'

let browserInstance: Browser | null = null

async function getBrowser(): Promise<Browser> {
  if (browserInstance) {
    return browserInstance
  }

  if (process.env.NODE_ENV === 'production') {
    const puppeteer = await import('puppeteer-core')
    const chromium = await import('@sparticuz/chromium')

    browserInstance = await puppeteer.default.launch({
      args: chromium.default.args,
      executablePath: await chromium.default.executablePath(),
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
  const browser = await getBrowser()
  let page: Page | null = null

  try {
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
  } finally {
    if (page) {
      await page.close()
    }
  }
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close()
    browserInstance = null
  }
}
