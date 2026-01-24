import { defineStore } from 'pinia'
import { useAuthApi } from '../services/auth.api'
import type { ISafeUser, ISafeSellerProfile, ILoginCredentials, IRegisterData } from '../types/auth.types'
import { safeUserSchema } from '~~/server/utils/auth/auth.schema'
import { notify } from '@kyvg/vue3-notification'
import {  navigateTo } from 'nuxt/app'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // ========== STATE ==========
  const userProfile = ref<ISafeUser | null>(null)
  const sellerCache = ref<Record<string, ISafeSellerProfile>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ========== GETTERS ==========
  const isLoggedIn = computed(() => {
    if (userProfile.value) return true
    const supabaseUser = useSupabaseUser()
    return !!supabaseUser.value
  })

  const isAuthenticated = computed(() => isLoggedIn.value) // Alias for consistency

  const user = computed(() => {
    if (!userProfile.value) return null

    // Return only safe fields validated by Zod
    return {
      id: userProfile.value.id,
      email: userProfile.value.email,
      username: userProfile.value.username,
      avatar: userProfile.value.avatar,
      role: userProfile.value.role,
    }
  })

  const isSeller = computed(() => userProfile.value?.role === 'seller')
  const isVerifiedSeller = computed(() => 
    userProfile.value?.sellerProfile?.is_verified || false
  )
  const sellerProfile = computed(() => userProfile.value?.sellerProfile || null)

  // ========== ACTIONS ==========

 async function login(credentials: ILoginCredentials) {
  const authApi = useAuthApi()
  isLoading.value = true
  error.value = null

  try {
    const response = await authApi.login(credentials)
    userProfile.value = response.user
    notify({ type: 'success', text: 'Login successful!' })
    return { success: true }
  } catch (e: any) {
    // 1. Extract the specific error code from the Nuxt Fetch Error
    const errorCode = e.data?.code || e.response?._data?.code 
    const errorMessage = e.data?.message || e.message

    error.value = errorMessage
    
    // 2. Return the error code so the composable can react to it
    return { 
      success: false, 
      error: errorMessage, 
      code: errorCode // <--- Pass this back to the caller(useAuth composable)
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
      // API client validates with Zod
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

// In your auth.store.ts - replace the fetchUserProfile method with this:

async function fetchUserProfile() {
  console.log('🔴 fetchUserProfile CALLED!')
  console.trace('🔴 STACK TRACE - Who called me?')
  const supabaseUser = useSupabaseUser()
  
  // Don't attempt if no Supabase user
  if (!supabaseUser.value) {
    userProfile.value = null
    return
  }

  const authApi = useAuthApi()
  isLoading.value = true
  error.value = null

  try {
    const response = await authApi.getProfile()

    // Validate response with Zod
    const validated = safeUserSchema.parse(response.user)
    userProfile.value = validated
    
    // Clear any previous errors
    error.value = null
  } catch (e: any) {
    // ❌ If 401, the session is invalid - clear it
    if (e.statusCode === 401 || e.response?.status === 401) {
      console.warn('Session is invalid (401), clearing auth state')
      userProfile.value = null
      error.value = null
      return
    }

    // ⚠️  Other errors - log but don't fail the app
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

  async function createSellerProfile(data: Partial<ISafeSellerProfile>) {
    const authApi = useAuthApi()
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

  async function getSellerBySlug(slug: string) {
    if (!slug) return null

    if (sellerCache.value[slug]) {
      return sellerCache.value[slug]
    }

    const authApi = useAuthApi()
    try {
      const response = await authApi.getSellerBySlug(slug)
      sellerCache.value[slug] = response.seller
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
      sellerCache.value = {}
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
    sellerCache.value = {}
    isLoading.value = false
    error.value = null
  }

  
  return {
    userProfile,
    sellerCache,
    isLoading,
    error,
    isLoggedIn,
    isAuthenticated,
    user,
    isSeller,
    isVerifiedSeller,
    sellerProfile,
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
