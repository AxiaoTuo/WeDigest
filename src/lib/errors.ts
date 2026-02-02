/**
 * 统一的错误处理工具
 * 提供错误分类、错误消息转换、错误上报等功能
 */

import { APIError } from './api/client'

// 错误类型枚举
export enum ErrorType {
  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // 服务器错误
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // 客户端错误
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',

  // 业务错误
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  API_KEY_INVALID = 'API_KEY_INVALID',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 错误严重程度
export enum ErrorSeverity {
  LOW = 'low',       // 用户可忽略
  MEDIUM = 'medium', // 影响部分功能
  HIGH = 'high',     // 影响核心功能
  CRITICAL = 'critical' // 系统无法使用
}

// 应用错误基类
export class AppError extends Error {
  constructor(
    public type: ErrorType,
    public severity: ErrorSeverity,
    message: string,
    public originalError?: unknown,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// 错误消息映射
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查网络设置',
  [ErrorType.TIMEOUT_ERROR]: '请求超时，请稍后重试',
  [ErrorType.UNAUTHORIZED]: '请先登录',
  [ErrorType.SESSION_EXPIRED]: '登录已过期，请重新登录',
  [ErrorType.SERVER_ERROR]: '服务器错误，请稍后重试',
  [ErrorType.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ErrorType.VALIDATION_ERROR]: '输入数据格式不正确',
  [ErrorType.NOT_FOUND]: '请求的资源不存在',
  [ErrorType.CONFLICT]: '操作冲突，请刷新后重试',
  [ErrorType.RATE_LIMIT_EXCEEDED]: '请求过于频繁，请稍后再试',
  [ErrorType.QUOTA_EXCEEDED]: '使用配额已用完',
  [ErrorType.API_KEY_INVALID]: 'API Key 无效或已过期',
  [ErrorType.UNKNOWN_ERROR]: '发生未知错误'
}

/**
 * 将任意错误转换为 AppError
 */
export function normalizeError(error: unknown): AppError {
  // 已经是 AppError
  if (error instanceof AppError) {
    return error
  }

  // API 错误
  if (error instanceof APIError) {
    const errorType = mapAPIErrorToType(error)
    const severity = mapStatusCodeToSeverity(error.statusCode)
    return new AppError(
      errorType,
      severity,
      error.message || ERROR_MESSAGES[errorType],
      error,
      { statusCode: error.statusCode, code: error.code, details: error.details }
    )
  }

  // 标准错误
  if (error instanceof Error) {
    // 网络错误
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new AppError(
        ErrorType.TIMEOUT_ERROR,
        ErrorSeverity.MEDIUM,
        ERROR_MESSAGES[ErrorType.TIMEOUT_ERROR],
        error
      )
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return new AppError(
        ErrorType.NETWORK_ERROR,
        ErrorSeverity.HIGH,
        ERROR_MESSAGES[ErrorType.NETWORK_ERROR],
        error
      )
    }

    // 其他错误
    return new AppError(
      ErrorType.UNKNOWN_ERROR,
      ErrorSeverity.MEDIUM,
      error.message || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
      error
    )
  }

  // 字符串错误
  if (typeof error === 'string') {
    return new AppError(
      ErrorType.UNKNOWN_ERROR,
      ErrorSeverity.MEDIUM,
      error,
      undefined
    )
  }

  // 未知类型
  return new AppError(
    ErrorType.UNKNOWN_ERROR,
    ErrorSeverity.MEDIUM,
    ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
    undefined,
    { originalError: error }
  )
}

/**
 * 映射 API 错误到错误类型
 */
function mapAPIErrorToType(error: APIError): ErrorType {
  switch (error.statusCode) {
    case 401:
      return ErrorType.UNAUTHORIZED
    case 403:
      return ErrorType.UNAUTHORIZED
    case 404:
      return ErrorType.NOT_FOUND
    case 409:
      return ErrorType.CONFLICT
    case 422:
    case 400:
      return ErrorType.VALIDATION_ERROR
    case 429:
      return ErrorType.RATE_LIMIT_EXCEEDED
    case 500:
    case 502:
    case 503:
      return ErrorType.SERVER_ERROR
    case 504:
      return ErrorType.TIMEOUT_ERROR
    default:
      return ErrorType.UNKNOWN_ERROR
  }
}

/**
 * 映射 HTTP 状态码到错误严重程度
 */
function mapStatusCodeToSeverity(statusCode: number): ErrorSeverity {
  if (statusCode >= 500) return ErrorSeverity.HIGH
  if (statusCode >= 400) return ErrorSeverity.MEDIUM
  return ErrorSeverity.LOW
}

/**
 * 获取用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  const appError = normalizeError(error)
  return appError.message
}

/**
 * 判断是否为可重试的错误
 */
export function isRetryableError(error: unknown): boolean {
  const appError = normalizeError(error)

  return [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT_ERROR,
    ErrorType.SERVER_ERROR,
    ErrorType.SERVICE_UNAVAILABLE
  ].includes(appError.type)
}

/**
 * 判断是否需要重新登录
 */
export function requiresAuth(error: unknown): boolean {
  const appError = normalizeError(error)
  return appError.type === ErrorType.SESSION_EXPIRED
}

/**
 * 错误上报（可以接入监控服务）
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  const appError = normalizeError(error)

  // 在开发环境打印详细错误
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Report]', {
      type: appError.type,
      severity: appError.severity,
      message: appError.message,
      context: { ...appError.context, ...context },
      stack: appError.stack
    })
  }

  // TODO: 接入监控服务（如 Sentry）
  // Sentry.captureException(appError, { extra: context })
}

/**
 * 处理错误并显示提示
 */
export async function handleError(
  error: unknown,
  options: {
    toast?: (message: string) => void
    onError?: (appError: AppError) => void
    context?: Record<string, unknown>
  } = {}
): Promise<void> {
  const appError = normalizeError(error)
  const { toast, onError, context } = options

  // 上报错误
  reportError(appError, context)

  // 调用错误回调
  onError?.(appError)

  // 显示提示
  if (toast) {
    toast(appError.message)
  }

  // 需要重新登录时跳转
  if (requiresAuth(appError)) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}
