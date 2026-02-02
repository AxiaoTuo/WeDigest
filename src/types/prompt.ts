export interface PromptTemplate {
  id: string
  userId: string | null
  name: string
  description: string | null
  category: string
  prompt: string
  variables: string[]
  isSystem: boolean
  isFavorite: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface PromptTemplateVariable {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  default?: string
  required?: boolean
}

export interface PromptTemplateFormData {
  name: string
  description: string
  category: string
  prompt: string
  variables: PromptTemplateVariable[]
}

export type PromptCategory =
  | 'custom'        // 自定义模板
  | 'technology'    // 技术文章
  | 'academic'      // 学术论文
  | 'product'       // 产品文档
  | 'news'          // 新闻资讯
  | 'tutorial'      // 教程指南
  | 'research'      // 研究报告

export const PROMPT_CATEGORIES: Record<PromptCategory, string> = {
  custom: '自定义',
  technology: '技术文章',
  academic: '学术论文',
  product: '产品文档',
  news: '新闻资讯',
  tutorial: '教程指南',
  research: '研究报告'
}
