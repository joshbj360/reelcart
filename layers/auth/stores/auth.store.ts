import { defineStore } from 'pinia'
import { useAuthApi } from '../services/auth.api'
import type { IProfile, ISellerProfile, ILoginCredentials, IRegisterData } from '../types/auth.types'
import { useSupabaseUser, useSupabaseClient } from '#imports'
import { notify } from '@kyvg/vue3-notification'
import { navigateTo } from 'nuxt/app'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // ========== API ==========
  const authApi = useAuthApi()

  // ========== STATE ==========
  const userProfile = ref<IProfile | null>(null)
  const sellerCache = ref<Record<string, ISellerProfile>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ========== GETTERS ==========
  const supabaseUser = useSupabaseUser()
  
  const isAuthenticated = computed(() => {
    // we check if we have a profile , or if supabase session exist
    if (userProfile.value) return true

    const supabaseUser = useSupabaseUser()
    return !!supabaseUser.value
  })
  const user = computed(() => {
    if (!supabaseUser.value) return null

    return {
      id: userProfile.value?.id,
      email: userProfile.value?.email,
      username: userProfile.value?.username,
      avatar: userProfile.value?.avatar,
      role: userProfile.value?.role
    }
    }
  )
  const isSeller = computed(() => userProfile.value?.role === 'seller')
  const isVerifiedSeller = computed(() => 
    userProfile.value?.sellerProfile?.is_verified || false
  )
  const sellerProfile = computed(() => userProfile.value?.sellerProfile || null)

  // ========== ACTIONS ==========

  /**
   * Login with email/password
   */
  async function login(credentials: ILoginCredentials) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      
      // ✅ Just set the user - plugin will handle cart merge
      userProfile.value = response.user
      
      notify({ type: 'success', text: 'Login successful!' })
      return { success: true }
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: e.message || 'Login failed' })
      return { success: false, error: e.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Register new user
   */
  async function register(data: IRegisterData) {
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

  /**
   * OAuth login
   */
  async function loginWithOAuth(provider: 'google' | 'facebook') {
    const supabase = useSupabaseClient()
    isLoading.value = true

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

  /**
   * Fetch current user profile
   */
  async function fetchUserProfile() {
    if (!isAuthenticated.value) return

    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.getProfile()
      
      // ✅ Just set the user - plugin handles side effects
      userProfile.value = response.user
    } catch (e: any) {
      error.value = e.message
      console.error('Failed to fetch user profile:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create seller profile
   */
  async function createSellerProfile(data: Partial<ISellerProfile>) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.createSellerProfile(data)
      userProfile.value = response.user
      
      notify({ type: 'success', text: 'Seller profile created successfully!' })
      return true
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: 'Failed to create seller profile' })
      console.error('Failed to create seller profile:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get seller profile by slug (with caching)
   */
  async function getSellerBySlug(slug: string) {
    if (!slug) return null
    
    // Return from cache if exists
    if (sellerCache.value[slug]) {
      return sellerCache.value[slug]
    }

    try {
      const response = await authApi.getSellerBySlug(slug)
      sellerCache.value[slug] = response.seller
      return response.seller
    } catch (e: any) {
      console.error(`Failed to fetch seller profile for ${slug}:`, e)
      return null
    }
  }

  /**
   * Logout
   */
  async function logout() {
    isLoading.value = true

    try {
      await authApi.logout()
      
      // ✅ Just clear the user - plugin handles cart clearing
      userProfile.value = null
      sellerCache.value = {}
      error.value = null
      
      notify({ type: 'success', text: 'Logged out successfully' })
      
      // Navigate to home
      navigateTo('/')
    } catch (e: any) {
      error.value = e.message
      notify({ type: 'error', text: 'Logout failed' })
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Clear error
   */
  function clearError() {
    error.value = null
  }

  /**
   * Reset store
   */
  function reset() {
    userProfile.value = null
    sellerCache.value = {}
    isLoading.value = false
    error.value = null
  }

  return {
    // State
    userProfile,
    sellerCache,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    user,
    isSeller,
    isVerifiedSeller,
    sellerProfile,
    
    // Actions
    login,
    register,
    loginWithOAuth,
    fetchUserProfile,
    createSellerProfile,
    getSellerBySlug,
    logout,
    clearError,
    reset,
  }
}, {
  persist: true,
})