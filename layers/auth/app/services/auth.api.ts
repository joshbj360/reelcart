// layers/auth/services/auth.api.ts
/**
 * Auth API Service
 * 
 * Handles all auth-related API calls
 * All requests go through BaseApiClient for CSRF protection, auth tokens, etc.
 */

import { BaseApiClient } from '../../../base/app/services/api/base.api'

export interface AuthApiResponse {
  success: boolean
  message?: string
  user?: any
  token?: string
}

export class AuthApiClient extends BaseApiClient {
  /**
   * Login with email and password
   */
  async login(credentials: { email: string; password: string }): Promise<any> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
  }

  /**
   * Register new user
   */
  async register(data: { email: string; password: string }): Promise<any> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    return this.request('/api/auth/profile', {
      method: 'GET',
    })
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Record<string, any>): Promise<any> {
    return this.request('/api/auth/profile', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Request password reset
   * Sends reset link to email
   */
  async requestPasswordReset(email: string): Promise<any> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    })
  }

  /**
   * Complete password reset
   * Validates token and sets new password
   */
  async completePasswordReset(token: string, password: string): Promise<any> {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    })
  }

  /**
   * Verify email with token
   */
  async verifyEmailToken(token: string): Promise<any> {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: { token },
    })
  }

  /**
   * Resend email verification link
   */
  async resendEmailVerification(email: string): Promise<any> {
    return this.request('/api/auth/verify-email/resend', {
      method: 'POST',
      body: { email },
    })
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<any> {
    return this.request('/api/auth/refresh-token', {
      method: 'POST',
    })
  }

  /**
   * Logout
   */
  async logout(): Promise<any> {
    return this.request('/api/auth/logout', {
      method: 'POST',
    })
  }

  /**
   * Login with OAuth provider
   */
  async loginWithOAuth(provider: 'google' | 'facebook'): Promise<any> {
    const supabase = useSupabaseClient()
    
    if (!supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      throw error
    }
  }

  /**
   * Create seller profile
   */
  async createSellerProfile(data: Record<string, any>): Promise<any> {
    return this.request('/api/auth/seller/profile', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Get seller profile by slug
   */
  async getSellerBySlug(slug: string): Promise<any> {
    return this.request(`/api/auth/seller/${slug}`, {
      method: 'GET',
    })
  }
}

/**
 * Composable to use AuthApiClient
 */
export const useAuthApi = () => {
  return new AuthApiClient()
}