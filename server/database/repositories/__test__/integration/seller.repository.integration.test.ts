// server/database/repositories/__tests__/integration/seller.repository.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { sellerRepository } from '../../seller.repository'

describe('Seller Repository - Integration Tests', () => {
  let testUserId: string

  beforeEach(async () => {
    const user = await global.testHelpers.createUser({
      email: `seller-test-${Date.now()}@test.com`,
      username: `seller-test-${Date.now()}`
    })
    testUserId = user.id
  })

  describe('Create & Retrieve', () => {
    it('should create seller profile', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-store-${Date.now()}`,
        store_description: 'A test store'
      })

      expect(seller).toBeDefined()
      expect(seller.store_name).toBe('Test Store')
      expect(seller.is_active).toBe(true)
      expect(seller.profileId).toBe(testUserId)
    })

    it('should get seller by ID', async () => {
      const created = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Store A',
        store_slug: `store-a-${Date.now()}`
      })

      const retrieved = await sellerRepository.getSellerProfile(created.id)
      expect(retrieved).toBeDefined()
      expect(retrieved?.id).toBe(created.id)
      expect(retrieved?.store_name).toBe('Store A')
    })

    it('should get seller by slug', async () => {
      const slug = `unique-slug-${Date.now()}`
      const created = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Slug Test Store',
        store_slug: slug
      })

      const retrieved = await sellerRepository.getSellerBySlug(slug)
      expect(retrieved).toBeDefined()
      expect(retrieved?.store_slug).toBe(slug)
    })
  })

  describe('Get User Sellers', () => {
    it('should get all user sellers', async () => {
      const seller1 = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Store 1',
        store_slug: `store-1-${Date.now()}`
      })

      const seller2 = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Store 2',
        store_slug: `store-2-${Date.now()}`
      })

      const sellers = await sellerRepository.getUserSellerProfiles(testUserId)
      expect(sellers.length).toBeGreaterThanOrEqual(2)
      expect(sellers.map(s => s.id)).toContain(seller1.id)
      expect(sellers.map(s => s.id)).toContain(seller2.id)
    })

    it('should get only active sellers', async () => {
      const active = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Active Store',
        store_slug: `active-${Date.now()}`
      })

      const inactive = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Inactive Store',
        store_slug: `inactive-${Date.now()}`
      })

      await sellerRepository.deactivateSellerProfile(inactive.id, testUserId)

      const activeSellers = await sellerRepository.getUserActiveSellerProfiles(testUserId)
      expect(activeSellers.map(s => s.id)).toContain(active.id)
      expect(activeSellers.map(s => s.id)).not.toContain(inactive.id)
      expect(activeSellers.every(s => s.is_active)).toBe(true)
    })

    it('should get only inactive sellers', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      await sellerRepository.deactivateSellerProfile(seller.id, testUserId)

      const inactiveSellers = await sellerRepository.getUserInactiveSellerProfiles(testUserId)
      expect(inactiveSellers.map(s => s.id)).toContain(seller.id)
      expect(inactiveSellers.every(s => !s.is_active)).toBe(true)
    })
  })

  describe('Update Seller', () => {
    it('should update seller profile', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Original Name',
        store_slug: `original-${Date.now()}`
      })

      const updated = await sellerRepository.updateSellerProfile(seller.id, testUserId, {
        store_name: 'Updated Name'
      })

      expect(updated.store_name).toBe('Updated Name')
    })

    it('should not update seller not owned by user', async () => {
      const otherUser = await global.testHelpers.createUser({
        email: `other-user-${Date.now()}@test.com`,
        username: `other-${Date.now()}`
      })

      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      try {
        await sellerRepository.updateSellerProfile(seller.id, otherUser.id, {
          store_name: 'Hacked'
        })
        expect.fail('Should throw unauthorized error')
      } catch (error: any) {
        expect(error.message).toContain('Unauthorized')
      }
    })
  })

  describe('Activate & Deactivate', () => {
    it('should deactivate seller profile', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      const deactivated = await sellerRepository.deactivateSellerProfile(seller.id, testUserId)
      expect(deactivated.is_active).toBe(false)
    })

    it('should activate seller profile', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      await sellerRepository.deactivateSellerProfile(seller.id, testUserId)
      const activated = await sellerRepository.activateSellerProfile(seller.id, testUserId)
      
      expect(activated.is_active).toBe(true)
    })

    it('should not deactivate already inactive seller', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      await sellerRepository.deactivateSellerProfile(seller.id, testUserId)

      try {
        await sellerRepository.deactivateSellerProfile(seller.id, testUserId)
        expect.fail('Should throw error')
      } catch (error: any) {
        expect(error.message).toContain('already deactivated')
      }
    })
  })

  describe('Slug Management', () => {
    it('should check if slug is taken', async () => {
      const slug = `unique-slug-${Date.now()}`
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Store with Slug',
        store_slug: slug
      })

      const isTaken = await sellerRepository.isStoreSlugTaken(slug)
      expect(isTaken).toBe(true)
    })

    it('should return false for available slug', async () => {
      const isTaken = await sellerRepository.isStoreSlugTaken(`available-slug-${Date.now()}-xyz`)
      expect(isTaken).toBe(false)
    })

    it('should check if user has slug', async () => {
      const slug = `user-slug-${Date.now()}`
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'My Store',
        store_slug: slug
      })

      const hasSlug = await sellerRepository.userHasSellerSlug(testUserId, slug)
      expect(hasSlug).toBe(true)
    })

    it('should suggest available slug', async () => {
      const baseSlugs = [`my-store-${Date.now()}`, `my-store-${Date.now()}-1`]
      const suggested = await sellerRepository.getSuggestedSlug(baseSlugs)

      expect(suggested).toBeDefined()
      expect(typeof suggested).toBe('string')
      expect(suggested.length).toBeGreaterThan(0)
    })
  })

  describe('Verification', () => {
    it('should update verification status', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      const updated = await sellerRepository.updateVerificationStatus(seller.id, 'VERIFIED')
      expect(updated.verification_status).toBe('VERIFIED')
    })

    it('should verify seller profile', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      const verified = await sellerRepository.verifySellerProfile(seller.id)
      expect(verified.is_verified).toBe(true)
      expect(verified.verification_status).toBe('VERIFIED')
    })
  })

  describe('Followers', () => {
    it('should increment follower count', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      const initialCount = seller.followers_count
      await sellerRepository.incrementFollowers(seller.id)

      const updated = await sellerRepository.getFollowerCount(seller.id)
      expect(updated).toBe(initialCount + 1)
    })

    it('should decrement follower count', async () => {
      const seller = await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Test Store',
        store_slug: `test-${Date.now()}`
      })

      await sellerRepository.incrementFollowers(seller.id)
      const countBefore = await sellerRepository.getFollowerCount(seller.id)

      await sellerRepository.decrementFollowers(seller.id)
      const countAfter = await sellerRepository.getFollowerCount(seller.id)

      expect(countAfter).toBe(countBefore - 1)
    })
  })

  describe('Batch Operations', () => {
    it('should deactivate all user sellers', async () => {
      await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Store 1',
        store_slug: `store-1-${Date.now()}`
      })

      await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Store 2',
        store_slug: `store-2-${Date.now()}`
      })

      const count = await sellerRepository.deactivateAllUserSellers(testUserId)
      expect(count).toBeGreaterThanOrEqual(2)

      const activeSellers = await sellerRepository.getUserActiveSellerProfiles(testUserId)
      expect(activeSellers.length).toBe(0)
    })

    it('should activate all user sellers', async () => {
      await sellerRepository.createSellerProfile(testUserId, {
        store_name: 'Store 1',
        store_slug: `store-1-${Date.now()}`
      })

      await sellerRepository.deactivateAllUserSellers(testUserId)
      const count = await sellerRepository.activateAllUserSellers(testUserId)

      expect(count).toBeGreaterThanOrEqual(1)

      const activeSellers = await sellerRepository.getUserActiveSellerProfiles(testUserId)
      expect(activeSellers.length).toBeGreaterThanOrEqual(1)
    })
  })
})