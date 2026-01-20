// layers/auth/composables/usePasswordReset.ts
/**
 * Password Reset Composable
 * 
 * Handles the password reset flow:
 * 1. Request reset (forgot password)
 * 2. Verify reset token
 * 3. Complete reset
 */

import { ref } from 'vue'

interface PasswordResetState {
  loading: boolean
  error: string | null
  success: boolean
}

interface PasswordResetResult {
  success: boolean
  message?: string
  error?: string
}

export const usePasswordReset = () => {
  const state = ref<PasswordResetState>({
    loading: false,
    error: null,
    success: false,
  })

  /**
   * Request password reset
   * Sends reset email to user
   */
  const requestReset = async (email: string): Promise<PasswordResetResult> => {
    state.value.loading = true
    state.value.error = null
    state.value.success = false

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      const response = await $fetch('/api/auth/forgot-password', {
        method: 'POST',
        body: { email },
      })

      if (response?.success) {
        state.value.success = true
        return { success: true, message: 'Reset email sent' }
      } else {
        throw new Error(response?.message || 'Failed to send reset email')
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'An error occurred'
      state.value.error = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Resend verification email
   * Used when initial verification email was lost
   */
  const resendVerificationEmail = async (email: string): Promise<PasswordResetResult> => {
    state.value.loading = true
    state.value.error = null

    try {
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      const response = await $fetch('/api/auth/resend-verification', {
        method: 'POST',
        body: { email },
      })

      if (response?.success) {
        return { success: true, message: 'Verification email sent' }
      } else {
        throw new Error(response?.message || 'Failed to send email')
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'An error occurred'
      state.value.error = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Complete password reset
   * Verifies token and updates password
   */
  const completeReset = async (
    token: string,
    newPassword: string
  ): Promise<PasswordResetResult> => {
    state.value.loading = true
    state.value.error = null
    state.value.success = false

    try {
      // Validate inputs
      if (!token) {
        throw new Error('No reset token provided')
      }

      if (!newPassword) {
        throw new Error('New password is required')
      }

      if (newPassword.length < 12) {
        throw new Error('Password must be at least 12 characters')
      }

      if (!/[A-Z]/.test(newPassword)) {
        throw new Error('Password must contain uppercase letter')
      }

      if (!/[a-z]/.test(newPassword)) {
        throw new Error('Password must contain lowercase letter')
      }

      if (!/[0-9]/.test(newPassword)) {
        throw new Error('Password must contain a number')
      }

      if (!/[!@#$%^&*]/.test(newPassword)) {
        throw new Error('Password must contain special character (!@#$%^&*)')
      }

      const response = await $fetch('/api/auth/reset-password', {
        method: 'POST',
        body: {
          token,
          password: newPassword,
        },
      })

      if (response?.success) {
        state.value.success = true
        return { success: true, message: 'Password reset successfully' }
      } else {
        throw new Error(response?.message || 'Failed to reset password')
      }
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'An error occurred'
      state.value.error = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      state.value.loading = false
    }
  }

  /**
   * Validate password strength
   * Returns validation result
   */
  const validatePasswordStrength = (password: string): {
    valid: boolean
    errors: string[]
  } => {
    const errors: string[] = []

    if (password.length < 12) {
      errors.push('Password must be at least 12 characters')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain lowercase letter')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain a number')
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain special character')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Reset state
   */
  const resetState = () => {
    state.value.loading = false
    state.value.error = null
    state.value.success = false
  }

  return {
    state,
    requestReset,
    resendVerificationEmail,
    completeReset,
    validatePasswordStrength,
    resetState,
  }
}