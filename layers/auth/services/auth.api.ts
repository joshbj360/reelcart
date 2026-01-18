
import { BaseApiClient } from '../../base/services/api/base.api'
import type { ISafeUser, ILoginCredentials, IRegisterData, ISafeSellerProfile } from '../types/auth.types'
import { loginSchema, registerSchema, safeUserSchema } from '../../../server/utils/auth/auth.schema'

export class AuthApiClient extends BaseApiClient {
  /**
   * Login with validation
   */
  async login(credentials: ILoginCredentials) {
    // Validate credentials before sending
    const validated = loginSchema.parse(credentials)

    const response = await this.request<{ user: ISafeUser; session: any }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: validated,
      }
    )

    // Validate response
    safeUserSchema.parse(response.user)

    return response
  }

  /**
   * Register with validation
   */
  async register(data: IRegisterData) {
    // Validate registration data
    const validated = registerSchema.parse(data)

    return this.request<{ success: boolean; user: any }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: validated,
      }
    )
  }

  /**
   * Get profile
   */
  async getProfile() {
    const response = await this.request<{ user: ISafeUser }>('/api/auth/profile')

    // Validate response
    safeUserSchema.parse(response.user)

    return response
  }

  /**
   * Create seller profile
   */
  async createSellerProfile(data: Partial<ISafeSellerProfile>) {
    return this.request<{ user: ISafeUser }>('/api/auth/seller/profile', {
      method: 'POST',
      body: data,
    })
  }

  /**
   * Get seller by slug
   */
  async getSellerBySlug(slug: string) {
    return this.request<{ seller: ISafeSellerProfile }>(`/api/auth/seller/${slug}`)
  }

  /**
   * Logout
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
