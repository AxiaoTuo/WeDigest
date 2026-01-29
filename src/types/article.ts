export interface Article {
  url: string
  title: string
  author?: string
  publishTime?: string
  content: string
  images: string[]
  wordCount: number
}

export interface ArticleMetadata {
  title: string
  author?: string
  publishTime?: string
  wordCount: number
}
