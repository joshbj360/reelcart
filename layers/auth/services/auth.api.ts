import { BaseApiClient } from '../../base/services/api/base.api'
import type { ILoginCredentials, IProfile, ISellerProfile, IRegisterData } from '../types/auth.types'
export class AuthApiClient extends BaseApiClient {
  /**
   * Login with email/password
   */
  async login(credentials: ILoginCredentials) {
    return this.request<{ user: IProfile; session: any }>('/api/auth/login', {
      method: 'POST',
      body: credentials,
    })
  }

  /**
   * Register new user
   */
  async register(data: IRegisterData) {
    return this.request<{ success: boolean; user: any }>('/api/auth/register', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    return this.request<{ user: IProfile }>('/api/auth/profile')
  }

  /**
   * Create seller profile
   */
  async createSellerProfile(data: Partial<ISellerProfile>) {
    return this.request<{ user: IProfile }>('/api/auth/seller/profile', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Get seller by slug
   */
  async getSellerBySlug(slug: string) {
    return this.request<{ seller: ISellerProfile }>(`/api/auth/seller/${slug}`)
  }

  /**
   * Logout (client-side only - Supabase)
   */
  async logout() {
    const supabase = useSupabaseClient()
    return supabase.auth.signOut()
  }
}

let authApiInstance: AuthApiClient | null = null

export function useAuthApi() {
  if (!authApiInstance) {
    authApiInstance = new AuthApiClient()
  }
  return authApiInstance
}