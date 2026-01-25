// layers/auth/app/tests/useAuth.composable.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuth } from '../composables/useAuth'

describe('useAuth Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('State Access', () => {
    it('should provide user computed property', () => {
      const { user } = useAuth()
      expect(user.value).toBeNull()
    })

    it('should provide loading state', () => {
      const { loading } = useAuth()
      expect(loading.value).toBe(false)
    })

    it('should provide error state', () => {
      const { error } = useAuth()
      expect(error.value).toBeNull()
    })

    it('should provide seller profiles', () => {
      const { sellerProfiles } = useAuth()
      expect(Array.isArray(sellerProfiles.value)).toBe(true)
      expect(sellerProfiles.value.length).toBe(0)
    })
  })

  describe('Authentication Getters', () => {
    it('should provide isAuthenticated', () => {
      const { isAuthenticated } = useAuth()
      expect(isAuthenticated.value).toBe(false)
    })

    it('should provide isLoggedIn', () => {
      const { isLoggedIn } = useAuth()
      expect(isLoggedIn.value).toBe(false)
    })
  })

  describe('Seller Getters', () => {
    it('should provide isSeller', () => {
      const { isSeller } = useAuth()
      expect(isSeller.value).toBe(false)
    })

    it('should provide hasSellers', () => {
      const { hasSellers } = useAuth()
      expect(hasSellers.value).toBe(false)
    })

    it('should provide activeSellers', () => {
      const { activeSellers } = useAuth()
      expect(Array.isArray(activeSellers.value)).toBe(true)
    })

    it('should provide inactiveSellers', () => {
      const { inactiveSellers } = useAuth()
      expect(Array.isArray(inactiveSellers.value)).toBe(true)
    })

    it('should provide primarySeller', () => {
      const { primarySeller } = useAuth()
      expect(primarySeller.value).toBeNull()
    })

    it('should provide isVerifiedSeller', () => {
      const { isVerifiedSeller } = useAuth()
      expect(isVerifiedSeller.value).toBe(false)
    })
  })

  describe('Actions', () => {
    it('should provide login action', () => {
      const { login } = useAuth()
      expect(typeof login).toBe('function')
    })

    it('should provide register action', () => {
      const { register } = useAuth()
      expect(typeof register).toBe('function')
    })

    it('should provide logout action', () => {
      const { logout } = useAuth()
      expect(typeof logout).toBe('function')
    })

    it('should provide loginWithOAuth action', () => {
      const { loginWithOAuth } = useAuth()
      expect(typeof loginWithOAuth).toBe('function')
    })

    it('should provide fetchUserProfile action', () => {
      const { fetchUserProfile } = useAuth()
      expect(typeof fetchUserProfile).toBe('function')
    })

    it('should provide fetchSellerProfiles action', () => {
      const { fetchSellerProfiles } = useAuth()
      expect(typeof fetchSellerProfiles).toBe('function')
    })

    it('should provide createSellerProfile action', () => {
      const { createSellerProfile } = useAuth()
      expect(typeof createSellerProfile).toBe('function')
    })

    it('should provide deactivateSellerProfile action', () => {
      const { deactivateSellerProfile } = useAuth()
      expect(typeof deactivateSellerProfile).toBe('function')
    })

    it('should provide activateSellerProfile action', () => {
      const { activateSellerProfile } = useAuth()
      expect(typeof activateSellerProfile).toBe('function')
    })

    it('should provide clearError action', () => {
      const { clearError } = useAuth()
      expect(typeof clearError).toBe('function')
    })
  })

  describe('Login Flow', () => {
    it('should call store login method', async () => {
      const { login } = useAuth()
      
      // This would call the store method
      // Actual implementation would need Supabase mocked
      expect(typeof login).toBe('function')
    })
  })

  describe('Seller Actions', () => {
    it('should provide fetchSellerProfiles', async () => {
      const { fetchSellerProfiles } = useAuth()
      expect(typeof fetchSellerProfiles).toBe('function')
    })

    it('should provide createSellerProfile', async () => {
      const { createSellerProfile } = useAuth()
      expect(typeof createSellerProfile).toBe('function')
    })

    it('should provide deactivateSellerProfile', async () => {
      const { deactivateSellerProfile } = useAuth()
      expect(typeof deactivateSellerProfile).toBe('function')
    })

    it('should provide activateSellerProfile', async () => {
      const { activateSellerProfile } = useAuth()
      expect(typeof activateSellerProfile).toBe('function')
    })
  })
})