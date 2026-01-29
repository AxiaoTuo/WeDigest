import OpenAI from 'openai'
import { BaseAIProvider } from './base'
import { SummaryOptions, SummaryResult } from '@/types/ai-provider'

export class OpenAIProvider extends BaseAIProvider {
  name = 'openai' as const
  displayName = 'OpenAI'

  async summarize(
    content: string,
    options: SummaryOptions,
    apiKey: string,
    baseUrl?: string,
    modelName?: string
  ): Promise<SummaryResult> {
    const usedBaseUrl = baseUrl || process.env.OPENAI_BASE_URL || undefined
    const model = modelName || 'gpt-4o-mini'

    console.log(`\n[OpenAI] 准备发送请求:`)
    console.log(`  - URL: ${usedBaseUrl || 'https://api.openai.com'}/v1/chat/completions`)
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
          role: 'system',
          content: '你是一个专业的内容分析助手，擅长总结文章要点。请始终返回有效的JSON格式。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }

    console.log(`[OpenAI] 请求体:`, JSON.stringify(requestBody, null, 2))

    const response = await client.chat.completions.create(requestBody as any)

    console.log(`[OpenAI] 完整响应:`, JSON.stringify(response, null, 2))

    if (!response.choices || response.choices.length === 0) {
      throw new Error(`OpenAI 返回无效响应: ${JSON.stringify(response)}`)
    }

    const responseText = response.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('OpenAI 返回空响应')
    }

    console.log(`[OpenAI] 响应成功\n`)

    return this.parseResponse(content, responseText)
  }
}
