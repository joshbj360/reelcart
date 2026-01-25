// layers/auth/stores/auth.store.ts
/**
 * Auth Store (Pinia)
 * 
 * Manages:
 * - User profile (single)
 * - Seller profiles (multiple - array)
 * - Authentication state
 * - Loading and error states
 */

import { defineStore } from 'pinia'
import { useAuthApi } from '../services/auth.api'
import type { ISafeUser, ISafeSellerProfile, ILoginCredentials, IRegisterData } from '../types/auth.types'
import { safeUserSchema } from '../../../../server/utils/auth/auth.schema'
import { notify } from '@kyvg/vue3-notification'
import { navigateTo } from 'nuxt/app'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // ========== STATE ==========
  const userProfile = ref<ISafeUser | null>(null)
  const sellerProfiles = ref<ISafeSellerProfile[]>([])  // ← ARRAY (multiple sellers)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ========== GETTERS ==========
  const isLoggedIn = computed(() => {
    if (userProfile.value) return true
    return false
  })

  const isAuthenticated = computed(() => isLoggedIn.value)

  const user = computed(() => {
    if (!userProfile.value) return null

    return {
      id: userProfile.value.id,
      email: userProfile.value.email,
      username: userProfile.value.username,
      avatar: userProfile.value.avatar,
      role: userProfile.value.role,
    }
  })

  // ========== SELLER GETTERS ==========
  
  const hasSellers = computed(() => sellerProfiles.value.length > 0)
  
  const activeSellerCount = computed(() => 
    sellerProfiles.value.filter(s => s.is_active).length
  )
  
  const inactiveSellerCount = computed(() => 
    sellerProfiles.value.filter(s => !s.is_active).length
  )

  const activeSellers = computed(() => 
    sellerProfiles.value.filter(s => s.is_active)
  )

  const inactiveSellers = computed(() => 
    sellerProfiles.value.filter(s => !s.is_active)
  )

  const isSeller = computed(() => hasSellers.value)
  
  const isVerifiedSeller = computed(() => 
    activeSellers.value.some(s => s.is_verified)
  )

  const primarySeller = computed(() => 
    activeSellers.value[0] || null
  )

  // ========== ACTIONS ==========

  async function login(credentials: ILoginCredentials) {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      userProfile.value = response.user
      
      // Clear sellers on new login
      sellerProfiles.value = []
      
      notify({ type: 'success', text: 'Login successful!' })
      return { success: true }
    } catch (e: any) {
      const errorCode = e.data?.code || e.response?._data?.code 
      const errorMessage = e.data?.message || e.message

      error.value = errorMessage
      
      return { 
        success: false, 
        error: errorMessage, 
        code: errorCode
      }
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: IRegisterData) {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.register(data)

      notify({
        type: 'success',
        text: 'Registration successful! Please check your email to verify.',
      })
      return { success: true, user: response.user }
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: e.message || 'Registration failed' })
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  async function loginWithOAuth(provider: 'google' | 'facebook') {
    const supabase = useSupabaseClient()
    isLoading.value = true
    error.value = null

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (oauthError) throw oauthError
    } catch (e: any) {
      error.value = e.message
      notify({
        type: 'error',
        text: e.message || `Failed to authenticate with ${provider}`,
      })
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserProfile() {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.getProfile()
      const validated = safeUserSchema.parse(response.user)
      userProfile.value = validated
      error.value = null
    } catch (e: any) {
      if (e.statusCode === 401 || e.response?.status === 401) {
        console.warn('Session is invalid (401), clearing auth state')
        userProfile.value = null
        sellerProfiles.value = []
        error.value = null
        return
      }

      error.value = e.message
      console.error('Failed to fetch user profile:', {
        message: e.message,
        status: e.statusCode || e.response?.status,
        endpoint: '/api/auth/profile'
      })
    } finally {
      isLoading.value = false
    }
  }

  // ========== SELLER ACTIONS ==========

  async function fetchSellerProfiles() {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.getSellerProfiles()
      sellerProfiles.value = response.sellers || []
      error.value = null
    } catch (e: any) {
      error.value = e.message
      console.error('Failed to fetch seller profiles:', e.message)
      sellerProfiles.value = []
    } finally {
      isLoading.value = false
    }
  }

  async function createSellerProfile(data: Partial<ISafeSellerProfile>) {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.createSellerProfile(data)
      
      // Add new seller to array
      sellerProfiles.value.push(response.seller)

      notify({ type: 'success', text: 'Seller profile created successfully!' })
      return { success: true, seller: response.seller }
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: e.message || 'Failed to create seller profile' })
      console.error('Failed to create seller profile:', e)
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  async function deactivateSellerProfile(sellerId: string) {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      await authApi.deactivateSellerProfile(sellerId)
      
      // Update seller in array
      const index = sellerProfiles.value.findIndex(s => s.id === sellerId)
      if (index !== -1 && sellerProfiles.value[index]) {
        sellerProfiles.value[index].is_active = false
      }

      notify({ type: 'success', text: 'Seller profile deactivated' })
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: e.message || 'Failed to deactivate seller profile' })
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  async function activateSellerProfile(sellerId: string) {
    const authApi = useAuthApi()
    isLoading.value = true
    error.value = null

    try {
      await authApi.activateSellerProfile(sellerId)
      
      // Update seller in array
      const index = sellerProfiles.value.findIndex(s => s.id === sellerId)
      if (index !== -1 && sellerProfiles.value[index]) {
        sellerProfiles.value[index].is_active = true
      }

      notify({ type: 'success', text: 'Seller profile reactivated' })
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: e.message || 'Failed to activate seller profile' })
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  async function getSellerBySlug(slug: string) {
    if (!slug) return null

    // Check local cache first
    const cached = sellerProfiles.value.find(s => s.store_slug === slug)
    if (cached) return cached

    const authApi = useAuthApi()
    try {
      const response = await authApi.getSellerBySlug(slug)
      return response.seller
    } catch (e: any) {
      console.error(`Failed to fetch seller profile for ${slug}:`, e)
      return null
    }
  }

  async function logout() {
    const authApi = useAuthApi()
    isLoading.value = true

    try {
      await authApi.logout()

      userProfile.value = null
      sellerProfiles.value = []
      error.value = null

      notify({ type: 'success', text: 'Logged out successfully' })
      navigateTo('/')
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: 'Logout failed' })
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function reset() {
    userProfile.value = null
    sellerProfiles.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    userProfile,
    sellerProfiles,
    isLoading,
    error,
    
    // User Getters
    isLoggedIn,
    isAuthenticated,
    user,

    // Seller Getters
    hasSellers,
    activeSellerCount,
    inactiveSellerCount,
    activeSellers,
    inactiveSellers,
    isSeller,
    isVerifiedSeller,
    primarySeller,

    // User Actions
    login,
    register,
    loginWithOAuth,
    fetchUserProfile,
    logout,

    // Seller Actions
    fetchSellerProfiles,
    createSellerProfile,
    deactivateSellerProfile,
    activateSellerProfile,
    getSellerBySlug,

    // Utilities
    clearError,
    reset,
  }
}, {
  persist: true,
})