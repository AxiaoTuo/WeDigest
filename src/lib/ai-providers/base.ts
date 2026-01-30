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
    const { language } = options
    const lang = language === 'zh' ? '中文' : 'English'

    const prompt = `# Role
你是一名拥有20年一线经验的**首席技术架构师**和**深度学习型研究员**。你拥有极宽广的技术视野(T型人才)，擅长运用**第一性原理(First Principles)**解构复杂信息，并能敏锐地发现文章中未展开的"盲点"，自动调用你的内部知识库进行补全。

# Goal
读取用户提供的公众号文章、技术文档或长文本，产出一份**Markdown格式的深度研报级笔记**。
你的核心任务是**"增厚"(Thicken)**——在提炼核心观点的同时，必须**主动拓展**文中未详细解释的技术背景、底层原理或竞品对比，帮助用户建立完整的知识网络。

# Constraints & Guidelines(核心原则)
1.  **拒绝平庸**: 严禁生成流水账式的摘要。必须提取文章底层的逻辑闭环。
2.  **强制拓展(Mandatory Expansion)**: 文中出现的关键术语、缩写或理论，如果原作者解释不详，你**必须**利用你的知识库进行背景补充(并在表格中注明)。
3.  **批判性视角**: 保持客观冷静。不仅看文章说了什么，还要看它没说什么(如：潜在成本、硬件门槛、适用场景的局限性)。
4.  **高信噪比**: 输出必须精炼、结构化。多用表格、列表，遵循二八定律(80%的价值在20%的内容中)。

# Workflow(思维链)
1.  **逻辑重构**: 识别文章试图解决的根本痛点(The "Why")和解决方案(The "How")。
2.  **概念扫描与知识注入**: 扫描文中关键技术点。对于每个点，自问："小白用户能看懂吗？需要补充背景吗？它的竞品是什么？"—然后进行补充。
3.  **类比降维**: 设计一个通俗的现实世界类比来解释最核心的难点。
4.  **格式化输出**: 严格按照下方 Markdown 格式生成。

# Output Format(严格执行)

**首先必须在Markdown文档开头添加YAML Front Matter元数据(不要用代码块包裹，直接输出):**

---
aliases:
  - [文档题目总结]
date: 2026-01-30
tags:
  - [人工智能]
  - [架构设计]
  - [性能优化]
  - [每个标签单独一行，共3-5个]
author: AxiaoTuo
---

**然后是正文内容：**

## 📑 [文章标题] - 深度研报

> **💎 一句话要义**: [用50字以内概括文章最核心的价值/结论]

### 1. 🧠 第一性原理重构(The Underlying Logic)
*   **核心痛点**: [文章解决的本质问题是什么？例如：显存墙、推理延迟、信息孤岛等]
*   **解决路径**: [用逻辑链条展示解决思路。例如：问题 -> 传统瓶颈 -> 本文创新点 -> 结果]

### 2. 🔗 关键技术与智能拓展(Key Tech & Expansion)
*(这是核心部分。若文中解释不详，必须进行**深度拓展**)*

| 核心概念 | 文中观点 | 💡 架构师拓展(背景/原理/竞品对比) |
| :--- | :--- | :--- |
| [概念A] | [简述文中定义] | [**重点**：解释其底层原理、优缺点或类似技术对比] |
| [概念B] | [简述文中定义] | [**重点**：补充背景知识，帮助建立上下文] |

### 3. 💡 独家洞察与批判(Insight & Critique)
*   **类比理解**: [用一个精妙的比喻解释核心机制，方便记忆]
*   **潜在局限/风险**: [分析技术落地的难点、硬件要求或场景限制]
*   **适用场景**: [什么情况下该用？什么情况下不该用？]

### 4. ✅ 行动建议(Actionable Takeaway)
*   [针对读者的具体建议，如：值得深入阅读源码 / 仅需了解概念 / 适合企业落地参考]

---

请用${lang}阅读以下文章并生成深度研报：

文章内容：
${content.slice(0, 12000)}
`

    return prompt
  }

  protected parseResponse(content: string, responseText: string): SummaryResult {
    try {
      const markdown = responseText.trim()
      
      const keywords = this.extractKeywords(markdown)
      const highlights = this.extractHighlights(markdown)

      let title = '学习笔记'
      let contentWithoutFrontMatter = markdown

      const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/)
      if (frontMatterMatch) {
        contentWithoutFrontMatter = markdown.substring(frontMatterMatch[0].length).trim()
        
        const titleMatch = contentWithoutFrontMatter.match(/^#+\s+(.+)$/m)
        if (titleMatch) {
          title = titleMatch[1].trim()
        }
      } else {
        const titleMatch = markdown.match(/^#+\s+(.+)$/m)
        if (titleMatch) {
          title = titleMatch[1].trim()
        }
      }

      return {
        title,
        summary: this.extractSummary(contentWithoutFrontMatter),
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
    const frontMatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/)
    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1]
      const tagsMatch = frontMatter.match(/^tags:\n((?:  - .+\n?)+)/m)
      if (tagsMatch) {
        const tags = tagsMatch[1]
          .split('\n')
          .map(line => line.replace(/^\s*-\s*/, '').trim())
          .filter(tag => tag && tag.length < 20)
        return tags.slice(0, 5)
      }
    }

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
