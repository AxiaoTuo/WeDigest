import OpenAI from 'openai'
import { BaseAIProvider } from './base'
import { SummaryOptions, SummaryResult } from '@/types/ai-provider'

export class DeepSeekProvider extends BaseAIProvider {
  name = 'deepseek' as const
  displayName = 'DeepSeek'

  async summarize(
    content: string,
    options: SummaryOptions,
    apiKey: string,
    baseUrl?: string,
    modelName?: string
  ): Promise<SummaryResult> {
    const usedBaseUrl = baseUrl || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    const model = modelName || 'deepseek-chat'

    console.log(`\n[DeepSeek] 准备发送请求:`)
    console.log(`  - URL: ${usedBaseUrl}/v1/chat/completions`)
    console.log(`  - Model: ${model}`)
    console.log(`  - API Key: ${apiKey.slice(0, 10)}...`)

    const client = new OpenAI({
      apiKey,
      baseURL: usedBaseUrl,
      timeout: 60000,
      dangerouslyAllowBrowser: false,
      maxRetries: 2,
      defaultHeaders: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    })

    const prompt = this.buildPrompt(content, options)

    const requestBody = {
      model,
      messages: [
        {
          role: 'system' as const,
          content: '你是一名专业的技术架构师和研究员，擅长生成深度研报级的学习笔记。请严格按照用户要求的Markdown格式输出，必须在文档开头生成YAML Front Matter元数据（包含aliases、date、tags、author）。'
        },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }

    console.log(`[DeepSeek] 请求体:`, JSON.stringify(requestBody, null, 2))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await client.chat.completions.create(requestBody as any)

    const responseText = response.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('DeepSeek 返回空响应')
    }

    console.log(`[DeepSeek] 响应成功\n`)

    return this.parseResponse(content, responseText)
  }
}
