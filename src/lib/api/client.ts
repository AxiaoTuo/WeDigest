/**
 * 统一的 API 客户端封装
 * 提供类型安全的 API 调用、错误处理、重试逻辑
 */

import { z } from 'zod'

// 错误类型
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// API 响应类型
export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

// 请求配置
interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

// 默认配置
const DEFAULT_CONFIG: Required<Omit<RequestConfig, 'headers'>> = {
  timeout: 60000,
  retries: 2,
  retryDelay: 1000
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  /**
   * 发送请求
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<APIResponse<T>> {
    const { timeout, retries, retryDelay, ...requestConfig } = {
      ...DEFAULT_CONFIG,
      ...config
    }

    const url = `${this.baseURL}${endpoint}`

    // 设置默认 headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...requestConfig.headers
    }

    let lastError: Error | null = null

    // 重试逻辑
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...requestConfig,
          headers,
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        // 处理非 JSON 响应
        if (!response.headers.get('content-type')?.includes('application/json')) {
          if (!response.ok) {
            throw new APIError(
              response.status,
              'NON_JSON_RESPONSE',
              `HTTP ${response.status}: ${response.statusText}`
            )
          }
          return { success: true } as APIResponse<T>
        }

        const data = await response.json()

        if (!response.ok) {
          throw new APIError(
            response.status,
            data.code || 'HTTP_ERROR',
            data.error || response.statusText,
            data.details
          )
        }

        return data
      } catch (error) {
        lastError = error as Error

        // 如果是 abort error（超时），重试
        if (error instanceof Error && error.name === 'AbortError') {
          if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
            continue
          }
        }

        // 如果是网络错误，重试
        if (error instanceof TypeError && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)))
          continue
        }

        // 其他错误不重试
        break
      }
    }

    // 所有重试都失败
    if (lastError instanceof APIError) {
      throw lastError
    }

    throw new APIError(
      500,
      'NETWORK_ERROR',
      lastError?.message || '网络请求失败'
    )
  }

  /**
   * GET 请求
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  /**
   * POST 请求
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * PUT 请求
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * PATCH 请求
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  /**
   * DELETE 请求
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<APIResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

// 导出单例实例
export const apiClient = new APIClient()

// 便捷方法
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) => apiClient.get<T>(endpoint, config),
  post: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => apiClient.post<T>(endpoint, data, config),
  put: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => apiClient.put<T>(endpoint, data, config),
  patch: <T>(endpoint: string, data?: unknown, config?: RequestConfig) => apiClient.patch<T>(endpoint, data, config),
  delete: <T>(endpoint: string, config?: RequestConfig) => apiClient.delete<T>(endpoint, config)
}

/**
 * 带验证的 API 调用
 * 使用 Zod schema 验证响应数据
 */
export async function fetchWithSchema<T>(
  fetcher: () => Promise<APIResponse<T>>,
  schema: z.ZodSchema<T>
): Promise<T> {
  const response = await fetcher()

  if (!response.success || !response.data) {
    throw new APIError(
      500,
      response.code || 'FETCH_ERROR',
      response.error || '请求失败'
    )
  }

  return schema.parse(response.data)
}
