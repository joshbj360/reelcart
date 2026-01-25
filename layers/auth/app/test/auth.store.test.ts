// layers/auth/app/tests/auth.store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../stores/auth.store'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Initial State', () => {
    it('should have null user profile initially', () => {
      const store = useAuthStore()
      expect(store.userProfile).toBeNull()
    })

    it('should have empty seller profiles initially', () => {
      const store = useAuthStore()
      expect(store.sellerProfiles).toEqual([])
    })

    it('should not be loading initially', () => {
      const store = useAuthStore()
      expect(store.isLoading).toBe(false)
    })

    it('should have no error initially', () => {
      const store = useAuthStore()
      expect(store.error).toBeNull()
    })
  })

  describe('Authentication State', () => {
    it('should not be logged in initially', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })

    it('should return null user when not logged in', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
    })

    it('should be logged in after setting profile', () => {
      const store = useAuthStore()
      store.userProfile = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        avatar: null,
        role: 'user',
        created_at: new Date(),
        sellerProfile: null,
      }

      expect(store.isLoggedIn).toBe(true)
      expect(store.isAuthenticated).toBe(true)
    })

    it('should return user data when logged in', () => {
      const store = useAuthStore()
      store.userProfile = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        avatar: 'avatar-url',
        role: 'user',
        created_at: new Date(),
        sellerProfile: null,
      }

      expect(store.user).toEqual({
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        avatar: 'avatar-url',
        role: 'user',
      })
    })
  })

  describe('Seller Profile Getters', () => {
    it('should not be seller with no profiles', () => {
      const store = useAuthStore()
      expect(store.hasSellers).toBe(false)
      expect(store.isSeller).toBe(false)
    })

    it('should be seller with seller profiles', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.hasSellers).toBe(true)
      expect(store.isSeller).toBe(true)
    })

    it('should count active sellers', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        },
        {
          id: 'seller-2',
          store_name: 'Store 2',
          store_slug: 'store-2',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.activeSellerCount).toBe(2)
    })

    it('should count inactive sellers', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        },
        {
          id: 'seller-2',
          store_name: 'Store 2',
          store_slug: 'store-2',
          is_verified: false,
          is_active: false,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.activeSellerCount).toBe(1)
      expect(store.inactiveSellerCount).toBe(1)
    })

    it('should filter active sellers', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        },
        {
          id: 'seller-2',
          store_name: 'Store 2',
          store_slug: 'store-2',
          is_verified: false,
          is_active: false,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.activeSellers).toHaveLength(1)
      expect(store.activeSellers[0]?.store_slug).toBe('store-1')
    })

    it('should filter inactive sellers', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        },
        {
          id: 'seller-2',
          store_name: 'Store 2',
          store_slug: 'store-2',
          is_verified: false,
          is_active: false,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.inactiveSellers).toHaveLength(1)
      expect(store.inactiveSellers[0]?.store_slug).toBe('store-2')
    })

    it('should get primary seller (first active)', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-2',
          store_name: 'Store 2',
          store_slug: 'store-2',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        },
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.primarySeller?.store_slug).toBe('store-2')
    })

    it('should return null primary seller if no active', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: false,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.primarySeller).toBeNull()
    })

    it('should check if verified seller exists', () => {
      const store = useAuthStore()
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: true,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        }
      ]

      expect(store.isVerifiedSeller).toBe(true)
    })
  })

  describe('State Management', () => {
    it('should clear error', () => {
      const store = useAuthStore()
      store.error = 'Some error'
      
      store.clearError()
      
      expect(store.error).toBeNull()
    })

    it('should reset all state', () => {
      const store = useAuthStore()
      store.userProfile = {
        id: 'user-1',
        email: 'test@example.com',
        username: 'testuser',
        avatar: null,
        role: 'user',
        created_at: new Date(),
        sellerProfile: null,
      }
      store.sellerProfiles = [
        {
          id: 'seller-1',
          store_name: 'Store 1',
          store_slug: 'store-1',
          is_verified: false,
          is_active: true,
          followers_count: 0,
          created_at: new Date(),
        }
      ]
      store.isLoading = true
      store.error = 'Some error'

      store.reset()

      expect(store.userProfile).toBeNull()
      expect(store.sellerProfiles).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
    })
  })
})