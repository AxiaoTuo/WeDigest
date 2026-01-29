import { BaseAIProvider } from './base'
import { SummaryOptions, SummaryResult } from '@/types/ai-provider'

export class ZhipuProvider extends BaseAIProvider {
  name = 'zhipu' as const
  displayName = '智谱AI'

  async summarize(
    content: string,
    options: SummaryOptions,
    apiKey: string,
    baseUrl?: string,
    modelName?: string
  ): Promise<SummaryResult> {
    const prompt = this.buildPrompt(content, options)

    const usedBaseUrl = baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    const model = modelName || 'glm-4-flash'

    console.log(`\n[智谱AI] 准备发送请求:`)
    console.log(`  - URL: ${usedBaseUrl}`)
    console.log(`  - Model: ${model}`)
    console.log(`  - API Key: ${apiKey.slice(0, 10)}...`)

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

    console.log(`[智谱AI] 请求体:`, JSON.stringify(requestBody, null, 2))

    const response = await fetch(usedBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify(requestBody)
    })

    console.log(`[智谱AI] 响应状态: ${response.status} ${response.statusText}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[智谱AI] 错误响应:`, errorText)
      throw new Error(`智谱AI请求失败: ${response.status}`)
    }

    const data = await response.json()
    const responseText = data.choices?.[0]?.message?.content

    if (!responseText) {
      throw new Error('智谱AI 返回空响应')
    }

    console.log(`[智谱AI] 响应成功\n`)

    return this.parseResponse(content, responseText)
  }
}
