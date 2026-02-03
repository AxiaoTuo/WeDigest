import { create } from 'zustand'
import { AIProviderType, SummaryOptions } from '@/types/ai-provider'
import { Article } from '@/types/article'

export type ProgressStep = 'validate' | 'fetch' | 'analyze' | 'generate' | 'idle' | 'complete'

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

  // Progress state for article fetching and generation
  progressStep: ProgressStep
  setProgressStep: (step: ProgressStep) => void
  progressMessage: string | null
  setProgressMessage: (message: string | null) => void

  // Reset all state
  reset: () => void
}

const initialState = {
  article: null,
  summaryId: null,
  selectedProvider: 'deepseek' as AIProviderType,
  summaryOptions: {
    style: 'detailed',
    language: 'zh'
  },
  isLoading: false,
  error: null,
  progressStep: 'idle' as ProgressStep,
  progressMessage: null
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setArticle: (article) => set({ article }),
  setSummaryId: (id) => set({ summaryId: id }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setSummaryOptions: (options) => set({ summaryOptions: options }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Progress state setters
  setProgressStep: (step) => set({ progressStep: step }),
  setProgressMessage: (message) => set({ progressMessage: message }),

  // Reset all state
  reset: () => set(initialState)
}))
