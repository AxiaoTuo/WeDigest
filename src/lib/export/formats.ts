import { HistoryDetail } from '@/types/api'

/**
 * 导出为 JSON 格式
 */
export function exportToJson(detail: HistoryDetail): string {
  const data = {
    meta: {
      title: detail.articleTitle,
      author: detail.articleAuthor,
      url: detail.articleUrl,
      provider: detail.provider,
      createdAt: detail.createdAt,
      exportedAt: new Date().toISOString()
    },
    content: {
      summary: detail.summary,
      markdown: detail.markdown,
      keywords: detail.keywords,
      original: detail.originalContent
    }
  }
  return JSON.stringify(data, null, 2)
}

/**
 * 导出为 HTML 格式（带内联样式）
 */
export function exportToHtml(detail: HistoryDetail): string {
  const keywordsHtml = detail.keywords
    .map(k => `<span class="keyword">${k}</span>`)
    .join(' ')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${detail.articleTitle}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { font-size: 28px; margin-bottom: 10px; color: #1a1a1a; }
    .meta { font-size: 14px; color: #666; margin-bottom: 20px; }
    .summary { background: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; margin-bottom: 30px; border-radius: 4px; }
    .summary h2 { font-size: 18px; margin-bottom: 10px; color: #0c4a6e; }
    .content { font-size: 16px; line-height: 1.8; }
    .content h1 { font-size: 24px; margin-top: 30px; margin-bottom: 15px; }
    .content h2 { font-size: 20px; margin-top: 25px; margin-bottom: 12px; }
    .content h3 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
    .content p { margin-bottom: 15px; }
    .content pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; margin: 15px 0; }
    .content code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
    .keywords { margin-top: 30px; }
    .keyword { display: inline-block; background: #e0e7ff; color: #6366f1; padding: 4px 12px; border-radius: 16px; font-size: 12px; margin-right: 8px; margin-bottom: 8px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${detail.articleTitle}</h1>
    <div class="meta">
      作者：${detail.articleAuthor || '未知'} |
      使用：${detail.provider.toUpperCase()} |
      创建时间：${new Date(detail.createdAt).toLocaleString('zh-CN')}
    </div>

    <div class="summary">
      <h2>摘要</h2>
      <p>${detail.summary}</p>
    </div>

    <div class="content">
      ${detail.markdown}
    </div>

    <div class="keywords">
      ${keywordsHtml}
    </div>

    <div class="footer">
      由 WeDigest (https://github.com/anthropics/claude-code) 生成
    </div>
  </div>
</body>
</html>`
}

/**
 * 导出为 Notion 兼容格式（带 YAML frontmatter）
 */
export function exportToNotion(detail: HistoryDetail): string {
  const yamlMeta = `---
title: ${detail.articleTitle}
author: ${detail.articleAuthor || '未知'}
url: ${detail.articleUrl}
provider: ${detail.provider}
created: ${detail.createdAt}
keywords: ${detail.keywords.join(', ')}
---

`

  return yamlMeta + detail.markdown
}
