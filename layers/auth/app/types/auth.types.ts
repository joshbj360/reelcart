// layers/auth/types/auth.types.ts - UPDATED
/**
 * Auth Layer Type Definitions
 * 
 * Imports safe types from schema
 * Extends with layer-specific types
 */

import type { Profile, SellerProfile } from '~~/prisma/generated/client'
import type { 
  ISafeUser, 
  ISafeSellerProfile, 
  ILoginCredentials, 
  IRegisterData 
} from '~~/server/utils/auth/auth.schema'

// ========== DATABASE TYPES ==========
// Internal - used by server/repositories

export interface IProfile extends Profile {
  sellerProfiles?: ISellerProfile[]
}

export type ISellerProfile = SellerProfile

// ========== CLIENT-SAFE TYPES ==========
// Exported from schema - safe to send to client

export type { 
  ISafeUser, 
  ISafeSellerProfile, 
  ILoginCredentials, 
  IRegisterData 
}

// ========== EXTENDED CLIENT TYPES ==========
// Additional types used in UI

export interface IAuthState {
  userProfile: ISafeUser | null
  sellerProfiles: ISafeSellerProfile[]
  isLoading: boolean
  error: string | null
}

export interface ILoginResponse {
  success: boolean
  user: ISafeUser
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at: number
}

export interface IRegisterResponse {
  success: boolean
  user: {
    id: string
    email: string
  }
  message: string
}

export interface ISellerCreateResponse {
  success: boolean
  seller: ISafeSellerProfile
  message: string
}

export interface ISellerListResponse {
  success: boolean
  sellers: ISafeSellerProfile[]
  count: number
  active_count: number
  inactive_count: number
}

export interface ILogoutResponse {
  success: boolean
  message: string
}