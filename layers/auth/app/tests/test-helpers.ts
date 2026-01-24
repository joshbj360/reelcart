import { vi } from 'vitest'

export const { mockServerSupabaseUser, mockFindProfileById } = vi.hoisted(() => ({
  mockServerSupabaseUser: vi.fn(),
  mockFindProfileById: vi.fn()
}))

// When this module is imported in test files, the following mocks are registered
vi.mock('#supabase/server', () => ({
  serverSupabaseUser: (...args: any[]) => mockServerSupabaseUser(...args)
}))

vi.mock('../database/repositories/auth.repository', () => ({
  authRepository: {
    findProfileById: (...args: any[]) => mockFindProfileById(...args)
  }
}))

export function stubCreateError() {
  vi.stubGlobal('createError', (opts: any) => new Error(opts.message || 'Error'))
}

export function createMockProfile(overrides: Record<string, any> = {}) {
  return {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    avatar: null,
    role: 'user',
    created_at: new Date(),
    sellerProfile: null,
    ...overrides
  }
}

export function createMockSellerProfile(overrides: Record<string, any> = {}) {
  return {
    id: 'seller-123',
    store_name: 'My Store',
    store_slug: 'my-store',
    is_verified: true,
    followers_count: 0,
    ...overrides
  }
}

export function resetAuthMocks() {
  mockServerSupabaseUser.mockReset && mockServerSupabaseUser.mockReset()
  mockFindProfileById.mockReset && mockFindProfileById.mockReset()
}
