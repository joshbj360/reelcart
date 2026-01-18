import { useAuthStore } from '../stores/auth.store'
import type { ILoginCredentials, IRegisterData } from '../types/auth.types'
import { useRouter } from 'vue-router'

/**
 * Auth composable - Provides convenient wrapper around auth store
 * 
 * RULE: Composables ONLY call store methods, never API or repository directly
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  /**
   * Login wrapper
   * Adds navigation logic on top of store.login()
   */
  const login = async (credentials: ILoginCredentials) => {
    const result = await authStore.login(credentials) // ✅ Calls store only
    
    if (result.success) {
      // Composable adds UI logic (navigation)
      const isSeller = authStore.isSeller
      router.push(isSeller ? '/sellers/dashboard' : '/')
    }
    
    return result
  }

  /**
   * Register wrapper
   * Just delegates to store
   */
  const register = async (data: IRegisterData) => {
    return authStore.register(data) // ✅ Calls store only
  }

  /**
   * Logout wrapper
   * Adds navigation logic
   */
  const logout = async () => {
    await authStore.logout() // ✅ Calls store only
    router.push('/auth/login')
  }

  /**
   * OAuth login wrapper
   */
  const loginWithOAuth = async (provider: 'google' | 'facebook') => {
    await authStore.loginWithOAuth(provider) // ✅ Calls store only
  }

  // Return reactive store state and wrapper methods
  return {
    // State (from store)
    user: computed(() => authStore.user),
    loading: computed(() => authStore.isLoading),
    error: computed(() => authStore.error),
    
    // Getters (from store)
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoggedIn: computed(() => authStore.isLoggedIn),
    isSeller: computed(() => authStore.isSeller),
    isVerifiedSeller: computed(() => authStore.isVerifiedSeller),
    sellerProfile: computed(() => authStore.sellerProfile),
    
    // Actions (wrapper methods)
    login,
    register,
    logout,
    loginWithOAuth,
    fetchUserProfile: authStore.fetchUserProfile,
    createSellerProfile: authStore.createSellerProfile,
    clearError: authStore.clearError,
  }
}

