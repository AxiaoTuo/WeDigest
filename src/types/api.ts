import { Article } from './article'
import { SummaryResult, AIProviderType, SummaryOptions } from './ai-provider'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface FetchArticleRequest {
  url: string
}

export interface FetchArticleResponse {
  article: Article
}

export interface SummarizeRequest {
  articleUrl: string
  content: string
  title: string
  author?: string
  provider: AIProviderType
  options: SummaryOptions
}

export interface SummarizeResponse {
  id: string
  result: SummaryResult
  createdAt: string
}

export interface HistoryItem {
  id: string
  articleUrl: string
  articleTitle: string
  articleAuthor?: string
  keywords: string[]
  provider: string
  createdAt: string
}

export interface HistoryDetail extends HistoryItem {
  originalContent: string
  summary: string
  markdown: string
}

export interface HistoryListResponse {
  items: HistoryItem[]
  total: number
  page: number
  limit: number
}

export interface ApiKeyInfo {
  provider: AIProviderType
  isActive: boolean
  createdAt: string
}

export interface SaveApiKeyRequest {
  provider: AIProviderType
  apiKey: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}
