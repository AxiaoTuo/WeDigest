import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: 'test-user-id', email: 'test@example.com' } },
    status: 'authenticated'
  })),
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: {} }),
    headers: new Headers(),
    status: 200,
    statusText: 'OK'
  })
) as jest.Mock

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks()

  // Setup default router mock
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }
  ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
})

afterEach(() => {
  jest.restoreAllMocks()
})
