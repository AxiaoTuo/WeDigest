import * as cheerio from 'cheerio'

export interface ParsedArticle {
  title: string
  author?: string
  publishTime?: string
  content: string
  images: string[]
  wordCount: number
}

export function parseWechatArticle(html: string): ParsedArticle {
  const $ = cheerio.load(html)

  const title = $('#activity-name').text().trim() ||
                $('h1.rich_media_title').text().trim() ||
                $('h2.rich_media_title').text().trim() ||
                '未知标题'

  const author = $('#js_name').text().trim() ||
                 $('.rich_media_meta_nickname').text().trim() ||
                 undefined

  const publishTime = $('#publish_time').text().trim() ||
                      $('.rich_media_meta_date').text().trim() ||
                      undefined

  $('#js_content img').each((_, el) => {
    const $img = $(el)
    const dataSrc = $img.attr('data-src')
    if (dataSrc) {
      $img.attr('src', dataSrc)
    }
  })

  const contentElement = $('#js_content')
  contentElement.find('script, style, iframe').remove()

  const content = contentElement.text()
    .replace(/\s+/g, ' ')
    .trim()

  const images: string[] = []
  contentElement.find('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src')
    if (src && !src.includes('data:image')) {
      images.push(src)
    }
  })

  const wordCount = content.length

  return {
    title,
    author,
    publishTime,
    content,
    images,
    wordCount
  }
}
