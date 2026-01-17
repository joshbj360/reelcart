import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transformToSafeUser, getAuthUser, requireAuth } from '../server/utils/auth.utils'
import { safeUserSchema } from '../utils/auth.schema'

import { mockServerSupabaseUser, mockFindProfileById, createMockProfile, stubCreateError, resetAuthMocks, createMockSellerProfile } from './test-helpers'

// Ensures createError is stubbed consistently for server utilities
stubCreateError()

describe('Auth Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAuthMocks()
  })

  describe('transformToSafeUser', () => {
    it('should correctly transform a raw profile to a safe user', () => {
      const rawProfile = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
        role: 'user',
        created_at: new Date('2023-01-01'),
        password_hash: 'secret',
        some_other_field: 'should-not-be-here',
        sellerProfile: null
      }

      const safeUser = transformToSafeUser(rawProfile)

      expect(safeUser).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
        role: 'user',
        created_at: rawProfile.created_at,
        sellerProfile: null
      })

      // Verify validation via schema
      const result = safeUserSchema.safeParse(safeUser)
      expect(result.success).toBe(true)
    })

    it('should include seller profile if present', () => {
      const rawProfile = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        avatar: null,
        role: 'seller',
        created_at: new Date(),
        sellerProfile: {
          id: 'seller-123',
          store_name: 'My Store',
          store_slug: 'my-store',
          is_verified: true,
          followers_count: 10,
          stripe_key: 'secret-key' // Should be filtered out
        }
      }

      const safeUser = transformToSafeUser(rawProfile)

      expect(safeUser.sellerProfile).toEqual({
        id: 'seller-123',
        store_name: 'My Store',
        store_slug: 'my-store',
        is_verified: true,
        followers_count: 10
      })
      expect((safeUser.sellerProfile as any).stripe_key).toBeUndefined()
    })

    it('should throw when sellerProfile has invalid types (schema enforcement)', () => {
      const rawProfile = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        avatar: null,
        role: 'seller',
        created_at: new Date(),
        sellerProfile: {
          id: 'seller-123',
          store_name: 'My Store',
          store_slug: 'my-store',
          is_verified: true,
          followers_count: 'not-a-number'
        }
      }

      expect(() => transformToSafeUser(rawProfile as any)).toThrow()
    })
  })

  describe('getAuthUser', () => {
    it('should return null if no supabase user', async () => {
      mockServerSupabaseUser.mockResolvedValue(null)
      const event = {} as any

      const result = await getAuthUser(event)
      expect(result).toBeNull()
      expect(mockFindProfileById).not.toHaveBeenCalled()
    })

    it('should return null if profile not found', async () => {
      mockServerSupabaseUser.mockResolvedValue({ id: 'user-123' })
      mockFindProfileById.mockResolvedValue(null)
      const event = {} as any

      const result = await getAuthUser(event)
      expect(result).toBeNull()
      expect(mockFindProfileById).toHaveBeenCalledWith('user-123')
    })

    it('should return safe user if profile found', async () => {
      mockServerSupabaseUser.mockResolvedValue({ id: 'user-123' })
      const profile = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'test',
        avatar: null, // Added explicit null to match schema optional/nullable expectations if strict
        role: 'user',
        created_at: new Date(),
        sellerProfile: null
      }
      mockFindProfileById.mockResolvedValue(profile)
      const event = {} as any

      const result = await getAuthUser(event)
      // We expect the result to be the transformed user
      // transformToSafeUser handles the transformation.
      // We can check equality
      expect(result).toMatchObject({
        id: 'user-123',
        email: 'test@example.com'
      })
    })

    it('should return null on error', async () => {
      mockServerSupabaseUser.mockResolvedValue({ id: 'user-123' })
      mockFindProfileById.mockRejectedValue(new Error('DB Error'))
      const event = {} as any

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await getAuthUser(event)

      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should return null if supabase user object has no id', async () => {
      mockServerSupabaseUser.mockResolvedValue({ email: 'no-id@example.com' })
      const event = {} as any

      const result = await getAuthUser(event)
      expect(result).toBeNull()
      expect(mockFindProfileById).not.toHaveBeenCalled()
    })
  })

  describe('requireAuth', () => {
    it('should throw 401 if user not authenticated', async () => {
      mockServerSupabaseUser.mockResolvedValue(null)
      const event = {} as any

      // requireAuth calls getAuthUser. If getAuthUser returns null, it throws.
      await expect(requireAuth(event)).rejects.toThrow('Unauthorized')
    })

    it('should return user if authenticated', async () => {
      mockServerSupabaseUser.mockResolvedValue({ id: 'user-123' })
      const profile = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'test',
        avatar: null,
        role: 'user',
        created_at: new Date(),
        sellerProfile: null
      }
      mockFindProfileById.mockResolvedValue(profile)
      const event = {} as any

      const result = await requireAuth(event)
      expect(result).toMatchObject({
        id: 'user-123',
        email: 'test@example.com'
      })
    })
  })
})
