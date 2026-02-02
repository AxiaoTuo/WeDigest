/**
 * API 客户端测试
 */

import { APIClient, APIError } from '@/lib/api/client'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as any

describe('APIClient', () => {
  let client: APIClient

  beforeEach(() => {
    client = new APIClient()
    mockFetch.mockClear()
  })

  describe('基础请求', () => {
    it('应该成功发送 GET 请求', async () => {
      const mockData = { success: true, data: { id: 1, name: 'Test' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: { get: () => 'application/json' }
      } as Response)

      const response = await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
      expect(response).toEqual(mockData)
    })

    it('应该成功发送 POST 请求', async () => {
      const mockData = { success: true, data: { id: 1 } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: { get: () => 'application/json' }
      } as Response)

      const response = await client.post('/test', { name: 'Test' })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' })
        })
      )
      expect(response).toEqual(mockData)
    })

    it('应该处理 JSON 响应', async () => {
      const mockData = { success: true, data: { result: 'success' } }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        headers: { get: () => 'application/json' }
      } as Response)

      const response = await client.get('/test')

      expect(response.data).toEqual({ result: 'success' })
    })
  })

  describe('错误处理', () => {
    it('应该处理 HTTP 错误状态', async () => {
      const errorResponse = { success: false, error: 'Not found' }
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => errorResponse,
        headers: { get: () => 'application/json' }
      } as Response)

      await expect(client.get('/test')).rejects.toThrow(APIError)
    })

    it('应该处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

      await expect(client.get('/test')).rejects.toThrow()
    })

    it('应该处理超时', async () => {
      mockFetch.mockImplementationOnce(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AbortError')), 100)
        )
      )

      await expect(client.get('/test', { timeout: 50 })).rejects.toThrow()
    })
  })

  describe('重试逻辑', () => {
    it('应该在失败时重试', async () => {
      // 第一次失败，第二次成功
      mockFetch
        .mockRejectedValueOnce(new TypeError('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true, data: {} }),
          headers: { get: () => 'application/json' }
        } as Response)

      const response = await client.get('/test', { retries: 1, retryDelay: 10 })

      expect(response.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('应该在所有重试失败后抛出错误', async () => {
      mockFetch.mockRejectedValue(new TypeError('Network error'))

      await expect(client.get('/test', { retries: 1, retryDelay: 10 }))
        .rejects.toThrow()
    })
  })
})

describe('APIError', () => {
  it('应该正确创建错误实例', () => {
    const error = new APIError(404, 'NOT_FOUND', 'Resource not found')

    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.message).toBe('Resource not found')
    expect(error.name).toBe('APIError')
  })
})
