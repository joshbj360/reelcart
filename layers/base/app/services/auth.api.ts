// layers/auth/app/services/auth.api.ts

/**
 * Auth API Service
 * Handles all auth API calls
 * Extends BaseApiClient for token injection, error handling, etc.
 */

import { BaseApiClient } from './base.api'

export class AuthApiClient extends BaseApiClient {

  // ==================== REGISTER ====================

  async register(data: {
    email: string
    username: string
    password: string
    confirmPassword: string
  }): Promise<any> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: data,
    })
  }

  // ==================== LOGIN ====================

  async login(data: {
    email: string
    password: string
  }): Promise<any> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: data,
    })
  }

  // ==================== LOGOUT ====================

  async logout(): Promise<any> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    })
  }

  // ==================== EMAIL VERIFICATION ====================

  async verifyEmail(token: string): Promise<any> {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
  }

  async resendVerificationEmail(email: string): Promise<any> {
    return this.request('/api/auth/send-verification-email', {
      method: 'POST',
      body: { email },
    })
  }

  // ==================== PASSWORD RESET ====================

  async requestPasswordReset(email: string): Promise<any> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    })
  }

  // ==================== REFRESH TOKEN ====================

  async refreshAccessToken(): Promise<any> {
    return this.request('/api/auth/refresh-token', {
      method: 'POST',
    })
  }
}

/**
 * Composable to use AuthApiClient
 * Returns singleton instance
 */
let instance: AuthApiClient | null = null

export const useAuthApi = () => {
  if (!instance) {
    instance = new AuthApiClient()
  }
  return instance
}