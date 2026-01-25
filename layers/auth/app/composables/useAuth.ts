// layers/auth/composables/useAuth.ts
/**
 * Auth Composable
 * 
 * Wrapper around auth store with navigation logic
 * RULE: Only calls store methods, never API/repository directly
 */

import { useAuthStore } from '../stores/auth.store'
import type { ILoginCredentials, IRegisterData } from '../types/auth.types'
import { useRouter } from 'nuxt/app'
import { computed } from 'vue'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  /**
   * Login wrapper with navigation
   */
  const login = async (credentials: ILoginCredentials) => {
    const result = await authStore.login(credentials)
    
    if (result.success) {
      const isSeller = authStore.isSeller
      router.push(isSeller ? '/sellers/dashboard' : '/')
      return result
    }

    // Handle specific error codes
    if (result.code === 'EMAIL_NOT_VERIFIED') {
      navigateTo(`/resend-verification?email=${encodeURIComponent(credentials.email)}`)
      return result
    }

    return result
  }

  /**
   * Register wrapper
   */
  const register = async (data: IRegisterData) => {
    return authStore.register(data)
  }

  /**
   * Logout wrapper with navigation
   */
  const logout = async () => {
    await authStore.logout()
  }

  /**
   * OAuth login wrapper
   */
  const loginWithOAuth = async (provider: 'google' | 'facebook') => {
    await authStore.loginWithOAuth(provider)
  }

  /**
   * Fetch user profile
   */
  const fetchUserProfile = async () => {
    await authStore.fetchUserProfile()
  }

  /**
   * Fetch seller profiles
   */
  const fetchSellerProfiles = async () => {
    await authStore.fetchSellerProfiles()
  }

  /**
   * Create seller profile
   */
  const createSellerProfile = async (data: any) => {
    return authStore.createSellerProfile(data)
  }

  /**
   * Deactivate seller
   */
  const deactivateSellerProfile = async (sellerId: string) => {
    return authStore.deactivateSellerProfile(sellerId)
  }

  /**
   * Activate seller
   */
  const activateSellerProfile = async (sellerId: string) => {
    return authStore.activateSellerProfile(sellerId)
  }

  return {
    // State (computed)
    user: computed(() => authStore.user),
    userProfile: computed(() => authStore.userProfile),
    sellerProfiles: computed(() => authStore.sellerProfiles),
    loading: computed(() => authStore.isLoading),
    error: computed(() => authStore.error),
    
    // Getters
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    isSeller: computed(() => authStore.isSeller),
    isVerifiedSeller: computed(() => authStore.isVerifiedSeller),
    hasSellers: computed(() => authStore.hasSellers),
    activeSellers: computed(() => authStore.activeSellers),
    inactiveSellers: computed(() => authStore.inactiveSellers),
    primarySeller: computed(() => authStore.primarySeller),
    
    // Actions
    login,
    register,
    logout,
    loginWithOAuth,
    fetchUserProfile,
    fetchSellerProfiles,
    createSellerProfile,
    deactivateSellerProfile,
    activateSellerProfile,
    clearError: () => authStore.clearError(),
  }
}