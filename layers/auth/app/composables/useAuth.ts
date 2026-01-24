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
  // composables/useAuth.ts

const login = async (credentials: ILoginCredentials) => {
  const result = await authStore.login(credentials)
  
  // Case A: Success
  if (result.success) {
    const isSeller = authStore.isSeller
    router.push(isSeller ? '/sellers/dashboard' : '/')
    return result
  }

  // Case B: Email Not Verified (Handle the specific error)
  // Ensure this string matches what you defined in AuthErrorCode.EMAIL_NOT_VERIFIED
  if (result.code === 'EMAIL_NOT_VERIFIED') {
    // Optional: Pass the email in the query so the verify page can pre-fill it
    navigateTo(`/resend-verification?email=${encodeURIComponent(credentials.email)}`)
    return result
  }

  // Case C: Other Errors (Wrong password, etc.)
  // The store already handled the notification/toast
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

