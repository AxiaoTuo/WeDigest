import { AIProvider, AIProviderType } from '@/types/ai-provider'
import { OpenAIProvider } from './openai'
import { DeepSeekProvider } from './deepseek'
import { ZhipuProvider } from './zhipu'

const providers: Record<AIProviderType, AIProvider> = {
  openai: new OpenAIProvider(),
  deepseek: new DeepSeekProvider(),
  zhipu: new ZhipuProvider()
}

export function getProvider(type: AIProviderType): AIProvider {
  const provider = providers[type]
  if (!provider) {
    throw new Error(`不支持的 AI 供应商: ${type}`)
  }
  return provider
}

export function getAvailableProviders(): Array<{ name: AIProviderType; displayName: string }> {
  return Object.values(providers).map(p => ({
    name: p.name,
    displayName: p.displayName
  }))
}

export function getDefaultProvider(): AIProviderType {
  const defaultProvider = process.env.DEFAULT_AI_PROVIDER as AIProviderType
  return defaultProvider && providers[defaultProvider] ? defaultProvider : 'deepseek'
}
