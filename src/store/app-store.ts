import { create } from 'zustand'
import { AIProviderType, SummaryOptions } from '@/types/ai-provider'
import { Article } from '@/types/article'

interface AppState {
  article: Article | null
  setArticle: (article: Article | null) => void

  summaryId: string | null
  setSummaryId: (id: string | null) => void

  selectedProvider: AIProviderType
  setSelectedProvider: (provider: AIProviderType) => void

  summaryOptions: SummaryOptions
  setSummaryOptions: (options: SummaryOptions) => void

  isLoading: boolean
  setIsLoading: (loading: boolean) => void

  error: string | null
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  article: null,
  setArticle: (article) => set({ article }),

  summaryId: null,
  setSummaryId: (id) => set({ summaryId: id }),

  selectedProvider: 'deepseek',
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),

  summaryOptions: {
    style: 'detailed',
    language: 'zh'
  },
  setSummaryOptions: (options) => set({ summaryOptions: options }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  error: null,
  setError: (error) => set({ error })
}))
