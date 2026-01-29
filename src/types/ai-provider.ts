export type AIProviderType = 'openai' | 'deepseek' | 'zhipu'

export interface SummaryOptions {
  style: 'brief' | 'detailed' | 'bullet-points'
  language: 'zh' | 'en'
  maxLength?: number
}

export interface SummaryResult {
  title: string
  summary: string
  keywords: string[]
  highlights: string[]
  readingTime: number
  markdown: string
}

export interface AIProvider {
  name: AIProviderType
  displayName: string
  summarize(content: string, options: SummaryOptions, apiKey: string, baseUrl?: string, modelName?: string): Promise<SummaryResult>
}

export interface ProviderConfig {
  apiKey: string
  baseUrl?: string
}
