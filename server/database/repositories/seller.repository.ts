// server/database/repositories/seller.repository.ts
/**
 * Seller Repository
 * 
 * Handles all seller profile database operations:
 * - Create/update/deactivate/activate seller profiles
 * - Query seller profiles
 * - Slug management
 * - Seller-specific queries
 * 
 * Auth operations: auth.repository.ts
 * User profile operations: user.repository.ts
 */

import { prismaClient as prisma } from '../client'

export const sellerRepository = {

  // ============================================
  // CREATE & RETRIEVE
  // ============================================

  /**
   * Create seller profile
   * User can have multiple seller profiles
   */
  async createSellerProfile(userId: string, data: {
    store_name: string
    store_slug: string
    store_description?: string
    store_logo?: string
    store_banner?: string
  }): Promise<any> {
    return prisma.sellerProfile.create({
      data: {
        profileId: userId,
        store_name: data.store_name,
        store_slug: data.store_slug,
        store_description: data.store_description,
        store_logo: data.store_logo,
        store_banner: data.store_banner,
        is_active: true,
      }
    })
  },

  /**
   * Get seller profile by ID
   */
  async getSellerProfile(sellerProfileId: string): Promise<any | null> {
    return prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
      include: {
        profile: {
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true
          }
        }
      }
    })
  },

  /**
   * Get seller profile by slug
   * Useful for public seller pages
   */
  async getSellerBySlug(slug: string): Promise<any | null> {
    return prisma.sellerProfile.findUnique({
      where: { store_slug: slug },
      include: {
        profile: {
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true
          }
        }
      }
    })
  },

  /**
   * Get seller by ID with all relations
   */
  async getSellerWithRelations(sellerProfileId: string): Promise<any | null> {
    return prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
      include: {
        profile: true,
        products: { take: 5 },
        wallet: true,
        followers: true,
        shippingZones: true,
        verificationDocuments: true,
      }
    })
  },

  // ============================================
  // GET USER'S SELLERS
  // ============================================

  /**
   * Get all seller profiles for a user
   * Includes both active and inactive
   */
  async getUserSellerProfiles(userId: string): Promise<any[]> {
    return prisma.sellerProfile.findMany({
      where: { profileId: userId },
      orderBy: { created_at: 'desc' }
    })
  },

  /**
   * Get active seller profiles for a user only
   */
  async getUserActiveSellerProfiles(userId: string): Promise<any[]> {
    return prisma.sellerProfile.findMany({
      where: {
        profileId: userId,
        is_active: true,
      },
      orderBy: { created_at: 'desc' }
    })
  },

  /**
   * Get inactive seller profiles for a user
   */
  async getUserInactiveSellerProfiles(userId: string): Promise<any[]> {
    return prisma.sellerProfile.findMany({
      where: {
        profileId: userId,
        is_active: false,
      },
      orderBy: { created_at: 'desc' }
    })
  },

  // ============================================
  // UPDATE
  // ============================================

  /**
   * Update seller profile info
   * Verifies ownership
   */
  async updateSellerProfile(
    sellerProfileId: string,
    userId: string,
    data: {
      store_name?: string
      store_description?: string
      store_logo?: string
      store_banner?: string
      store_location?: string
      store_phone?: string
      store_website?: string
      store_socials?: Record<string, any>
    }
  ): Promise<any> {
    // Verify ownership
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId }
    })

    if (!seller || seller.profileId !== userId) {
      throw new Error('Unauthorized: Seller profile does not belong to this user')
    }

    return prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: {
        ...(data.store_name && { store_name: data.store_name }),
        ...(data.store_description && { store_description: data.store_description }),
        ...(data.store_logo && { store_logo: data.store_logo }),
        ...(data.store_banner && { store_banner: data.store_banner }),
        ...(data.store_location && { store_location: data.store_location }),
        ...(data.store_phone && { store_phone: data.store_phone }),
        ...(data.store_website && { store_website: data.store_website }),
        ...(data.store_socials && { store_socials: data.store_socials }),
      }
    })
  },

  // ============================================
  // ACTIVATE / DEACTIVATE
  // ============================================

  /**
   * Deactivate seller profile
   * Sets is_active = false
   * Profile data is preserved
   */
  async deactivateSellerProfile(sellerProfileId: string, userId: string): Promise<any> {
    // Verify ownership
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId }
    })

    if (!seller || seller.profileId !== userId) {
      throw new Error('Unauthorized: Seller profile does not belong to this user')
    }

    if (!seller.is_active) {
      throw new Error('Seller profile is already deactivated')
    }

    return prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: { is_active: false }
    })
  },

  /**
   * Activate (reactivate) seller profile
   * Sets is_active = true
   */
  async activateSellerProfile(sellerProfileId: string, userId: string): Promise<any> {
    // Verify ownership
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId }
    })

    if (!seller || seller.profileId !== userId) {
      throw new Error('Unauthorized: Seller profile does not belong to this user')
    }

    if (seller.is_active) {
      throw new Error('Seller profile is already active')
    }

    return prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: { is_active: true }
    })
  },

  // ============================================
  // SLUG MANAGEMENT
  // ============================================

  /**
   * Check if store slug is taken (regardless of active status)
   * Useful for validation
   */
  async isStoreSlugTaken(slug: string): Promise<boolean> {
    const seller = await prisma.sellerProfile.findUnique({
      where: { store_slug: slug }
    })
    return !!seller
  },

  /**
   * Check if store slug is taken by active seller only
   * Useful for public pages
   */
  async isStoreSlugTakenActive(slug: string): Promise<boolean> {
    const seller = await prisma.sellerProfile.findUnique({
      where: { store_slug: slug }
    })
    return !!seller && seller.is_active
  },

  /**
   * Check if user already has seller profile with this slug
   */
  async userHasSellerSlug(userId: string, slug: string): Promise<boolean> {
    const seller = await prisma.sellerProfile.findFirst({
      where: {
        profileId: userId,
        store_slug: slug
      }
    })
    return !!seller
  },

  /**
   * Get available slug suggestion
   * Appends number if slug taken
   */
  async getSuggestedSlug(baseSlugs: string[]): Promise<string> {
    for (const baseSlug of baseSlugs) {
      const isTaken = await this.isStoreSlugTaken(baseSlug)
      if (!isTaken) {
        return baseSlug
      }
      
      // Try with number suffix
      for (let i = 1; i <= 100; i++) {
        const suggestedSlug = `${baseSlug}-${i}`
        const isSuggestionTaken = await this.isStoreSlugTaken(suggestedSlug)
        if (!isSuggestionTaken) {
          return suggestedSlug
        }
      }
    }

    // Fallback - shouldn't reach here
    return `seller-${Date.now()}`
  },

  // ============================================
  // VERIFICATION & STATUS
  // ============================================

  /**
   * Update seller verification status
   */
  async updateVerificationStatus(
    sellerProfileId: string,
    status: 'PENDING' | 'VERIFIED' | 'REJECTED',
    reason?: string
  ): Promise<any> {
    return prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: {
        verification_status: status,
        verification_reason: reason || null,
      }
    })
  },

  /**
   * Mark seller as verified
   */
  async verifySellerProfile(sellerProfileId: string): Promise<any> {
    return prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: {
        is_verified: true,
        verification_status: 'VERIFIED',
      }
    })
  },

  // ============================================
  // FOLLOWERS & STATS
  // ============================================

  /**
   * Increment followers count
   */
  async incrementFollowers(sellerProfileId: string): Promise<any> {
    return prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: {
        followers_count: { increment: 1 }
      }
    })
  },

  /**
   * Decrement followers count
   */
  async decrementFollowers(sellerProfileId: string): Promise<any> {
    return prisma.sellerProfile.update({
      where: { id: sellerProfileId },
      data: {
        followers_count: { decrement: 1 }
      }
    })
  },

  /**
   * Get follower count for seller
   */
  async getFollowerCount(sellerProfileId: string): Promise<number> {
    const seller = await prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
      select: { followers_count: true }
    })
    return seller?.followers_count || 0
  },

  // ============================================
  // BATCH OPERATIONS
  // ============================================

  /**
   * Deactivate all sellers for user
   * (Useful if user account is suspended)
   */
  async deactivateAllUserSellers(userId: string): Promise<number> {
    const result = await prisma.sellerProfile.updateMany({
      where: {
        profileId: userId,
        is_active: true,
      },
      data: { is_active: false }
    })
    return result.count
  },

  /**
   * Activate all sellers for user
   */
  async activateAllUserSellers(userId: string): Promise<number> {
    const result = await prisma.sellerProfile.updateMany({
      where: {
        profileId: userId,
        is_active: false,
      },
      data: { is_active: true }
    })
    return result.count
  }
}