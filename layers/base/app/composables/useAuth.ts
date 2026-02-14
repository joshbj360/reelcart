// layers/auth/app/composables/useAuth.ts

/**
 * Authentication Composable
 * Manages login, register, logout, and user state
 * Works with AuthApiClient and auth.store
 */

import { computed } from 'vue'
import { useAuthApi } from '../services/auth.api'
import { useAuthStore } from '../stores/auth.store'
import { useProfileStore } from '~~/layers/profile/app/stores/profile.store'
import { useProfileApi } from '~~/layers/profile/app/services/profile.api'
import type { IProduct } from '~~/layers/post/app/types/post.types'
import type { IProfile } from '~~/layers/profile/app/types/profile.types'
export const useAuth = () => {
  const authStore = useAuthStore()
  const profileStore = useProfileStore()
  const authApi = useAuthApi()
  const profileApi = useProfileApi()
  const router = useRouter()

  // ==================== STATE ====================
  const accessToken = computed(() => authStore.accessToken)
  const refreshToken = computed(() => authStore.refreshToken)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)
  const message = computed(() => authStore.message)

  // ==================== REGISTER ====================

  const register = async (
    email: string,
    username: string,
    password: string,
    confirmPassword: string
  ) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.register({
        email,
        username,
        password,
        confirmPassword
      })

      authStore.setMessage('Registration successful! Please check your email to verify your account.')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/user-login')
      }, 2000)

      return result
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.statusMessage || 
        error.message || 
        'Registration failed'
      
      authStore.setError(errorMessage)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== LOGIN ====================

  const login = async (email: string, password: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.login({
        email,
        password
      })

      if (!result) {
        throw new Error('Login failed')
      }

      // Store tokens
      authStore.setAccessToken(result.accessToken)
      authStore.setRefreshToken(result.refreshToken)

      await syncUserToProfile(result.user)

      authStore.setMessage('Logged in successfully!')

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        router.push('/')
      }, 1000)

      return result
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.statusMessage || 
        error.message || 
        'Login failed'
      
      authStore.setError(errorMessage)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== LOGOUT ====================

  const logout = async () => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      await authApi.logout()
      
      // Clear state
      authStore.clearAuth()
      
      authStore.setMessage('Logged out successfully')

      // Redirect to login
      setTimeout(() => {
        router.push('/user-login')
      }, 500)
    } catch (error: any) {
      console.error('Logout error:', error)
      // Still clear auth even if API call fails
      authStore.clearAuth()
      router.push('/user-login')
    } finally {
      authStore.setLoading(false)
    }
  }

   /**
   * Sync authenticated user to profile store
   * Fetches full profile data from user API
   */
  const syncUserToProfile = async (user: any) => {
    try {
      const profileData = await profileApi.getPrivateProfile()
      const profileStats = await profileApi.getProfileStats(profileData.data.username as string)

      // 4. Update the store
      profileStore.setPrivateProfile(profileData.data)


      if (profileStats) {
        profileStore.setProfileStats(profileData.data.username as string, profileStats.data)
      }

      console.log('✅ User synced via Profile Service:', profileData.data.username)
    } catch (error) {
      console.error('Failed to sync user:', error)
      
      // Fallback: Use minimal user data from auth
      profileStore.setPrivateProfile({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
        bio: user.bio || null,
        created_at: user.createdAt || new Date().toISOString()
      } as IProfile)
    }
  }

  // ==================== NEW: INITIALIZE USER ====================

  /**
   * Initialize user profile on app startup
   * Called from plugin or middleware
   */
 const initializeUser = async () => {
  // Only run if we have a token but no user
    if (!authStore.accessToken) return

    try {
      // Fetch current user from API
      const userData = await  profileApi.getPrivateProfile()
      
      await syncUserToProfile(userData)

      console.log('✅ User initialized via API Service')
    } catch (error) {
      console.error('Initialization failed:', error)
      authStore.clearAuth()
    }
  }

  // ==================== VERIFY EMAIL ====================

  const verifyEmail = async (token: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.verifyEmail(token)

      authStore.setMessage('Email verified successfully! You can now log in.')

      setTimeout(() => {
        router.push('/user-login')
      }, 2000)

      return result
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.statusMessage || 
        error.message || 
        'Email verification failed'
      
      authStore.setError(errorMessage)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== RESEND VERIFICATION ====================

  const resendVerificationEmail = async (email: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.resendVerificationEmail(email)

      authStore.setMessage('Verification email sent! Check your inbox.')

      return result
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.statusMessage || 
        error.message || 
        'Failed to send verification email'
      
      authStore.setError(errorMessage)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== PASSWORD RESET ====================

  const requestPasswordReset = async (email: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      const result = await authApi.requestPasswordReset(email)

      authStore.setMessage('If an account exists with this email, you will receive a password reset link.')

      return result
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.statusMessage || 
        error.message || 
        'Failed to request password reset'
      
      authStore.setError(errorMessage)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
    authStore.setLoading(true)
    authStore.setError(null)

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const result = await authApi.resetPassword(token, newPassword)

      authStore.setMessage('Password reset successfully! You can now log in with your new password.')

      setTimeout(() => {
        router.push('/user-login')
      }, 2000)

      return result
    } catch (error: any) {
      const errorMessage = 
        error.response?.data?.statusMessage || 
        error.message || 
        'Password reset failed'
      
      authStore.setError(errorMessage)
      throw error
    } finally {
      authStore.setLoading(false)
    }
  }

  // ==================== REFRESH TOKEN ====================

  const refreshAccessToken = async () => {
    try {
      const result = await authApi.refreshAccessToken()

      authStore.setAccessToken(result.accessToken)

      return result
    } catch (error: any) {
      console.error('Token refresh failed:', error)
      // Clear auth on refresh failure
      authStore.clearAuth()
      throw error
    }
  }

  // ==================== RETURN ====================

  return {
    // State
    accessToken,
    refreshToken,
    isLoading,
    error,
    message,
    // Methods
    register,
    login,
    logout,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    refreshAccessToken,
    initializeUser,
    syncUserToProfile
  }
}
