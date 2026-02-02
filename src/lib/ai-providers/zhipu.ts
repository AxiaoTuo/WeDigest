import { BaseAIProvider } from './base'
import { SummaryOptions, SummaryResult, StreamChunk } from '@/types/ai-provider'

export class ZhipuProvider extends BaseAIProvider {
  name = 'zhipu' as const
  displayName = '智谱AI'

  async summarize(
    content: string,
    options: SummaryOptions,
    apiKey: string,
    baseUrl?: string,
    modelName?: string,
    customTemplate?: string
  ): Promise<SummaryResult> {
    const prompt = this.buildPrompt(content, options, customTemplate)

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
          content: '你是一名专业的技术架构师和研究员，擅长生成深度研报级的学习笔记。请严格按照用户要求的Markdown格式输出，必须在文档开头生成YAML Front Matter元数据（包含aliases、date、tags、author）。'
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

  async summarizeStream(
    content: string,
    options: SummaryOptions,
    apiKey: string,
    onChunk: (chunk: StreamChunk) => void,
    baseUrl?: string,
    modelName?: string,
    customTemplate?: string
  ): Promise<SummaryResult> {
    const prompt = this.buildPrompt(content, options, customTemplate)
    const usedBaseUrl = baseUrl || 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
    const model = modelName || 'glm-4-flash'

    console.log(`\n[智谱AI Stream] 准备发送流式请求:`)
    console.log(`  - URL: ${usedBaseUrl}`)
    console.log(`  - Model: ${model}`)

    const requestBody = {
      model,
      messages: [
        {
          role: 'system',
          content: '你是一名专业的技术架构师和研究员，擅长生成深度研报级的学习笔记。请严格按照用户要求的Markdown格式输出，必须在文档开头生成YAML Front Matter元数据（包含aliases、date、tags、author）。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
      stream: true
    }

    const response = await fetch(usedBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'text/event-stream',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[智谱AI Stream] 错误响应:`, errorText)
      throw new Error(`智谱AI流式请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('智谱AI 返回无效响应流')
    }

    const decoder = new TextDecoder()
    let fullResponse = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n').filter(line => line.trim())

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim()
          if (data === '[DONE]') {
            onChunk({ content: '', done: true })
            break
          }

          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              fullResponse += delta
              onChunk({ content: delta, done: false })
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    console.log(`[智谱AI Stream] 响应成功\n`)

    return this.parseResponse(content, fullResponse)
  }
}
