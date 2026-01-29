import { AIProvider, SummaryOptions, SummaryResult } from '@/types/ai-provider'

export abstract class BaseAIProvider implements AIProvider {
  abstract name: AIProvider['name']
  abstract displayName: string

  abstract summarize(
    content: string,
    options: SummaryOptions,
    apiKey: string,
    baseUrl?: string,
    modelName?: string
  ): Promise<SummaryResult>

  protected buildPrompt(content: string, options: SummaryOptions): string {
    const { style, language } = options
    const lang = language === 'zh' ? '中文' : 'English'

    let instruction = ''
    switch (style) {
      case 'brief':
        instruction = `请生成一份简洁的学习笔记，包含：
1. 核心观点（2-3句话概括文章主旨）
2. 关键要点（列出3-5个最重要的观点）
3. 精简内容，便于快速浏览`
        break
      case 'detailed':
        instruction = `请生成一份详细的学习笔记，包含：
1. 核心观点（完整概述文章主旨和核心论点）
2. 详细要点（展开文章的各个主要部分，每部分包含具体内容和逻辑）
3. 关键概念解释（解释文章中的重要概念、术语，提供必要的背景信息）
4. 重要细节/案例（记录文章中的关键细节、数据和实例）
5. 思考与启发（从文章中提炼出的思考、感悟或行动建议）

笔记要求：
- 结构清晰，层次分明
- 对原文进行适当总结和拓展
- 用自己的话重新组织，避免大段原文引用
- 添加必要的注释和说明，便于理解
- 使用标题、加粗等格式突出重点
- 字数控制在1500字以内`
        break
      case 'bullet-points':
        instruction = `请生成一份结构化的学习笔记，包含：
1. 核心观点（一句话概括）
2. 主要要点（6-8个要点，每个要点用2-3句话说明）
3. 关键概念（列出并简要解释文中的重要概念）
4. 实践建议（从文章中提炼的可操作建议）

笔记要求：
- 使用清晰的层级结构
- 每个要点独立完整
- 简洁明了，便于记忆
- 总字数控制在1000字以内`
        break
    }

    return `你是一个专业的学习笔记助手。请用${lang}阅读以下文章，并生成一份结构清晰、易于阅读和整理的学习笔记。

${instruction}

输出格式：直接使用 Markdown 格式，不要包含 JSON 或其他标记。

文章内容：
${content.slice(0, 12000)}
`
  }

  protected parseResponse(content: string, responseText: string): SummaryResult {
    try {
      const markdown = responseText.trim()

      const titleMatch = markdown.match(/^#\s+(.+)$/m)
      const title = titleMatch ? titleMatch[1].trim() : '学习笔记'

      const keywords = this.extractKeywords(markdown)
      const highlights = this.extractHighlights(markdown)

      return {
        title,
        summary: this.extractSummary(markdown),
        keywords,
        highlights,
        readingTime: Math.ceil(markdown.length / 300),
        markdown
      }
    } catch (error) {
      throw new Error(`解析响应失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  private extractSummary(markdown: string): string {
    const summaryMatch = markdown.match(/##?\s*[核心观点|核心论点|Overview|Summary][:：\s*]?\n([\s\S]*?)(?=\n##|\n*---|\Z)/i)
    if (summaryMatch) {
      return summaryMatch[1].trim().substring(0, 200)
    }
    const lines = markdown.split('\n').filter(line => line.trim())
    return lines.slice(1, 4).join(' ').substring(0, 200) || '学习笔记'
  }

  private extractKeywords(markdown: string): string[] {
    const keywordMatch = markdown.match(/##?\s*[关键词|Keywords][:：\s*]?\n([\s\S]*?)(?=\n##|\n*---|\Z)/i)
    if (keywordMatch) {
      const keywords = keywordMatch[1]
        .split('\n')
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(k => k && k.length < 20)
      return keywords.slice(0, 5)
    }
    return []
  }

  private extractHighlights(markdown: string): string[] {
    const lines = markdown.split('\n')
    const highlights: string[] = []

    for (let i = 0; i < lines.length && highlights.length < 5; i++) {
      const line = lines[i].trim()
      if (line.match(/^[-*]\s+/) && line.length > 10 && line.length < 100) {
        highlights.push(line.replace(/^[-*]\s+/, '').trim())
      }
    }

    return highlights
  }
}
