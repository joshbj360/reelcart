import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth.store'

// Mock dependencies
const mockAuthApi = {
  login: vi.fn(),
  register: vi.fn(),
  getProfile: vi.fn(),
  createSellerProfile: vi.fn(),
  getSellerBySlug: vi.fn(),
  logout: vi.fn()
}

const mockSupabase = {
  auth: {
    signInWithOAuth: vi.fn(),
    signOut: vi.fn()
  }
}

vi.mock('../services/auth.api', () => ({
  useAuthApi: () => mockAuthApi
}))

vi.mock('#imports', () => ({
  useSupabaseUser: vi.fn(() => ({ value: null })),
  useSupabaseClient: vi.fn(() => mockSupabase),
  defineStore: (id: string, setup: any) => {
    // Basic mock implementation for defineStore in tests if needed,
    // but typically pinia/nuxt handles this.
    // However, since we are testing the store definition which is standard Pinia,
    // we rely on the actual defineStore from pinia (imported in the file).
    // The import in the file is `import { defineStore } from 'pinia'`.
    // Wait, the file uses `useSupabaseUser` from `#imports`.
    return setup
  }
}))

vi.mock('@kyvg/vue3-notification', () => ({
  notify: vi.fn()
}))

vi.mock('nuxt/app', () => ({
  navigateTo: vi.fn()
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default state', () => {
    const store = useAuthStore()
    expect(store.userProfile).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isLoading).toBe(false)
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const store = useAuthStore()
      const mockUser = { id: '1', email: 'test@example.com', role: 'user' }
      mockAuthApi.login.mockResolvedValue({ user: mockUser })

      const result = await store.login({ email: 'test@example.com', password: 'password' })

      expect(result.success).toBe(true)
      expect(store.userProfile).toEqual(mockUser)
      expect(store.isAuthenticated).toBe(true)
      expect(mockAuthApi.login).toHaveBeenCalled()
    })

    it('should handle login failure', async () => {
      const store = useAuthStore()
      mockAuthApi.login.mockRejectedValue(new Error('Invalid credentials'))

      const result = await store.login({ email: 'test@example.com', password: 'wrong' })

      expect(result.success).toBe(false)
      expect(store.error).toBe('Invalid credentials')
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      const store = useAuthStore()
      const mockUser = { id: '1', email: 'test@example.com' }
      mockAuthApi.register.mockResolvedValue({ user: mockUser })

      const result = await store.register({ email: 'test@example.com', password: 'password' })

      expect(result.success).toBe(true)
      expect(mockAuthApi.register).toHaveBeenCalled()
    })

    it('should handle registration failure', async () => {
      const store = useAuthStore()
      mockAuthApi.register.mockRejectedValue(new Error('Email taken'))

      const result = await store.register({ email: 'test@example.com', password: 'password' })

      expect(result.success).toBe(false)
      expect(store.error).toBe('Email taken')
    })
  })

  describe('fetchUserProfile', () => {
    it('should fetch user profile', async () => {
      const store = useAuthStore()
      // Simulate authenticated state partially
      store.userProfile = { id: '1' } as any
      // But fetchUserProfile checks isAuthenticated.
      // isAuthenticated returns true if userProfile is set.

      const mockUser = { id: '1', email: 'updated@example.com', role: 'user' }
      mockAuthApi.getProfile.mockResolvedValue({ user: mockUser })

      await store.fetchUserProfile()

      expect(store.userProfile).toEqual(mockUser)
      expect(mockAuthApi.getProfile).toHaveBeenCalled()
    })
  })

  describe('createSellerProfile', () => {
    it('should create seller profile', async () => {
      const store = useAuthStore()
      const mockUser = {
        id: '1',
        role: 'seller',
        sellerProfile: { store_name: 'Store' }
      }
      mockAuthApi.createSellerProfile.mockResolvedValue({ user: mockUser })

      const result = await store.createSellerProfile({ store_name: 'Store' })

      expect(result).toBe(true)
      expect(store.userProfile).toEqual(mockUser)
    })
  })

  describe('getSellerBySlug', () => {
    it('should return cached seller', async () => {
      const store = useAuthStore()
      const mockSeller = { id: 's1', store_slug: 'store1' }
      store.sellerCache['store1'] = mockSeller as any

      const result = await store.getSellerBySlug('store1')
      expect(result).toEqual(mockSeller)
      expect(mockAuthApi.getSellerBySlug).not.toHaveBeenCalled()
    })

    it('should fetch seller if not cached', async () => {
      const store = useAuthStore()
      const mockSeller = { id: 's1', store_slug: 'store1' }
      mockAuthApi.getSellerBySlug.mockResolvedValue({ seller: mockSeller })

      const result = await store.getSellerBySlug('store1')

      expect(result).toEqual(mockSeller)
      expect(store.sellerCache['store1']).toEqual(mockSeller)
      expect(mockAuthApi.getSellerBySlug).toHaveBeenCalledWith('store1')
    })
  })

  describe('logout', () => {
    it('should logout and reset state', async () => {
      const store = useAuthStore()
      store.userProfile = { id: '1' } as any

      await store.logout()

      expect(store.userProfile).toBeNull()
      expect(mockAuthApi.logout).toHaveBeenCalled()
    })
  })
})
