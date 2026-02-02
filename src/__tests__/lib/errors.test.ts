/**
 * 错误处理工具测试
 */

import { normalizeError, getErrorMessage, isRetryableError, requiresAuth, ErrorType, AppError } from '@/lib/errors'
import { APIError } from '@/lib/api/client'

describe('错误处理工具', () => {
  describe('normalizeError', () => {
    it('应该处理 AppError', () => {
      const originalError = new AppError(ErrorType.NETWORK_ERROR, 'medium', 'Network failed')
      const normalized = normalizeError(originalError)

      expect(normalized).toBe(originalError)
    })

    it('应该处理 APIError', () => {
      const apiError = new APIError(404, 'NOT_FOUND', 'Resource not found')
      const normalized = normalizeError(apiError)

      expect(normalized).toBeInstanceOf(AppError)
      expect(normalized.type).toBe(ErrorType.NOT_FOUND)
    })

    it('应该处理标准 Error', () => {
      const error = new Error('Something went wrong')
      const normalized = normalizeError(error)

      expect(normalized).toBeInstanceOf(AppError)
      expect(normalized.type).toBe(ErrorType.UNKNOWN_ERROR)
    })

    it('应该处理网络错误', () => {
      const error = new TypeError('Failed to fetch')
      const normalized = normalizeError(error)

      expect(normalized).toBeInstanceOf(AppError)
      expect(normalized.type).toBe(ErrorType.NETWORK_ERROR)
    })

    it('应该处理字符串错误', () => {
      const error = 'String error message'
      const normalized = normalizeError(error)

      expect(normalized).toBeInstanceOf(AppError)
      expect(normalized.message).toBe('String error message')
    })

    it('应该处理未知类型错误', () => {
      const error = { unknown: 'object' }
      const normalized = normalizeError(error)

      expect(normalized).toBeInstanceOf(AppError)
      expect(normalized.type).toBe(ErrorType.UNKNOWN_ERROR)
    })
  })

  describe('getErrorMessage', () => {
    it('应该返回用户友好的错误消息', () => {
      const apiError = new APIError(404, 'NOT_FOUND', 'Resource not found')
      const message = getErrorMessage(apiError)

      expect(typeof message).toBe('string')
      expect(message.length).toBeGreaterThan(0)
    })

    it('应该为网络错误返回特定消息', () => {
      const networkError = new TypeError('Failed to fetch')
      const message = getErrorMessage(networkError)

      expect(message).toContain('网络')
    })
  })

  describe('isRetryableError', () => {
    it('应该识别网络错误为可重试', () => {
      const networkError = new TypeError('Failed to fetch')
      expect(isRetryableError(networkError)).toBe(true)
    })

    it('应该识别服务器错误为可重试', () => {
      const serverError = new APIError(500, 'SERVER_ERROR', 'Internal server error')
      expect(isRetryableError(serverError)).toBe(true)
    })

    it('应该识别客户端错误为不可重试', () => {
      const clientError = new APIError(400, 'VALIDATION_ERROR', 'Invalid input')
      expect(isRetryableError(clientError)).toBe(false)
    })

    it('应该识别 404 错误为不可重试', () => {
      const notFoundError = new APIError(404, 'NOT_FOUND', 'Not found')
      expect(isRetryableError(notFoundError)).toBe(false)
    })
  })

  describe('requiresAuth', () => {
    it('应该识别 401 错误需要重新登录', () => {
      const authError = new APIError(401, 'UNAUTHORIZED', 'Unauthorized')
      expect(requiresAuth(authError)).toBe(true)
    })

    it('应该识别 403 错误需要重新登录', () => {
      const forbiddenError = new APIError(403, 'FORBIDDEN', 'Forbidden')
      expect(requiresAuth(forbiddenError)).toBe(true)
    })

    it('应该识别其他错误不需要重新登录', () => {
      const error = new APIError(404, 'NOT_FOUND', 'Not found')
      expect(requiresAuth(error)).toBe(false)
    })
  })

  describe('AppError', () => {
    it('应该正确创建错误实例', () => {
      const error = new AppError(
        ErrorType.NETWORK_ERROR,
        'high',
        'Network failed',
        new Error('Original error'),
        { url: '/api/test' }
      )

      expect(error.type).toBe(ErrorType.NETWORK_ERROR)
      expect(error.severity).toBe('high')
      expect(error.message).toBe('Network failed')
      expect(error.originalError).toBeDefined()
      expect(error.context).toEqual({ url: '/api/test' })
    })

    it('应该设置正确的错误名称', () => {
      const error = new AppError(ErrorType.UNKNOWN_ERROR, 'low', 'Unknown error')

      expect(error.name).toBe('AppError')
    })
  })
})
