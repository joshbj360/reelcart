import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoist mocks
const { mockSupabase, mockAuthRepository } = vi.hoisted(() => ({
  mockSupabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  },
  mockAuthRepository: {
    findOrCreateProfile: vi.fn(),
    createProfile: vi.fn()
  }
}))

// Mock dependencies
vi.mock('#supabase/server', () => ({
  serverSupabaseClient: () => mockSupabase,
  serverSupabaseUser: () => null
}))

vi.mock('../database/repositories/auth.repository', () => ({
  authRepository: mockAuthRepository
}))

// Stub globals BEFORE import
// defineEventHandler needs to be available when the module is imported
vi.stubGlobal('defineEventHandler', (handler: any) => handler)
vi.stubGlobal('readBody', vi.fn())
vi.stubGlobal('getRequestURL', () => ({ origin: 'http://localhost:3000' }))
vi.stubGlobal('createError', (err: any) => err)

// Mock auth utils
vi.mock('../server/utils/auth.utils', () => ({
  transformToSafeUser: (profile: any) => ({ ...profile, _safe: true }),
  requireAuth: vi.fn()
}))

// Import handlers AFTER globals are stubbed
// Vitest automatically hoists vi.mock, but vi.stubGlobal is executed at runtime.
// We must ensure the stub happens before the import.
// Using `await import` inside tests or setup? No, top level imports run first.
// BUT `vi.stubGlobal` should be hoisted? No, it's not.
// Use `vi.hoisted` to stub globals? No, that's for hoisting variables.
// Solution: Use `beforeAll` or ensure side-effects?
// Or just move imports inside the test or use `await import()` in `beforeAll`?
// Let's use `vi.importActual` logic or dynamic imports.

describe('Auth Server API Handlers', () => {
  let loginHandler: any
  let registerHandler: any
  let meHandler: any
  let requireAuth: any

  beforeEach(async () => {
    vi.clearAllMocks()

    // Reset modules to ensure globals are picked up?
    // Actually, just importing them dynamically inside test/beforeEach ensures globals are set.
    loginHandler = (await import('../server/api/login.post.ts')).default
    registerHandler = (await import('../server/api/register.post.ts')).default
    meHandler = (await import('../server/api/me.get.ts')).default
    const utils = await import('../server/utils/auth.utils')
    requireAuth = utils.requireAuth
  })

  describe('login.post', () => {
    it('should login user and return safe profile', async () => {
      const event = {} as any
      const body = { email: 'test@example.com', password: 'password123' }

      // Mock readBody
      ;(global.readBody as any).mockResolvedValue(body)

      // Mock Supabase success
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'u1', email: 'test@example.com', user_metadata: {} },
          session: { access_token: 'token', expires_at: 12345 }
        },
        error: null
      })

      // Mock DB profile
      mockAuthRepository.findOrCreateProfile.mockResolvedValue({
        id: 'u1',
        email: 'test@example.com',
        role: 'user'
      })

      const result = await loginHandler(event)

      expect(result.user).toEqual({ id: 'u1', email: 'test@example.com', role: 'user', _safe: true })
      expect(result.session).toBeDefined()
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({ email: body.email, password: body.password })
      expect(mockAuthRepository.findOrCreateProfile).toHaveBeenCalled()
    })

    it('should throw error on invalid input', async () => {
      const event = {} as any
      const body = { email: 'invalid-email', password: 'short' }
      ;(global.readBody as any).mockResolvedValue(body)

      await expect(loginHandler(event)).rejects.toThrow()
    })

    it('should throw error on supabase failure', async () => {
      const event = {} as any
      const body = { email: 'test@example.com', password: 'password123' }
      ;(global.readBody as any).mockResolvedValue(body)

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login' }
      })

      try {
        await loginHandler(event)
      } catch (e: any) {
        expect(e.message).toBe('Invalid login')
        expect(e.statusCode).toBe(401)
      }
    })
  })

  describe('register.post', () => {
    it('should register user and create profile', async () => {
      const event = {} as any
      const body = { email: 'new@example.com', password: 'password123', username: 'newuser' }
      ;(global.readBody as any).mockResolvedValue(body)

      mockSupabase.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'u2', email: 'new@example.com' }
        },
        error: null
      })

      mockAuthRepository.findOrCreateProfile.mockResolvedValue({
        id: 'u2',
        email: 'new@example.com',
        username: 'newuser',
        role: 'user'
      })

      const result = await registerHandler(event)

      expect(result.success).toBe(true)
      expect(result.user._safe).toBe(true)
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
        email: body.email,
        options: expect.objectContaining({
          data: { username: 'newuser' }
        })
      }))
      expect(mockAuthRepository.findOrCreateProfile).toHaveBeenCalled()
    })

    it('should fail on invalid input', async () => {
      const event = {} as any
      const body = { email: 'bad' } // missing password
      ;(global.readBody as any).mockResolvedValue(body)

      try {
        await registerHandler(event)
      } catch (e: any) {
        expect(e.statusCode).toBe(400)
      }
    })
  })

  describe('me.get', () => {
    it('should return user from requireAuth', async () => {
      const event = {} as any
      const mockUser = { id: 'u1', email: 'test@test.com' }

      // Mock requireAuth implementation
      ;(requireAuth as any).mockResolvedValue(mockUser)

      const result = await meHandler(event)
      expect(result.user).toBe(mockUser)
      expect(requireAuth).toHaveBeenCalledWith(event)
    })
  })
})
