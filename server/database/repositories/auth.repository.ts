import { prismaDb } from '../client'
import type { ISafeUser } from '~~/layers/auth/types/auth.types'
import { safeUserSchema } from '~~/server/utils/auth/auth.schema'

export class AuthRepository {
  /**
   * Find user by ID
   * Returns sanitized data via Zod
   */
  async findByProfileId(userId: string): Promise<ISafeUser | null> {
    const profile = await prismaDb.profile.findUnique({
      where: { id: userId },
      include: {
        sellerProfile: true,
      },
    })

    if (!profile) return null

    // Validate and sanitize before returning
    return this.sanitizeProfile(profile)
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<ISafeUser | null> {
    const profile = await prismaDb.profile.findUnique({
      where: { email },
      include: {
        sellerProfile: true,
      },
    })

    if (!profile) return null
    return this.sanitizeProfile(profile)
  }

  /**
   * Create new user profile
   */
  async createProfile(data: {
    id: string
    email: string
    username: string
    avatar?: string | null
  }): Promise<ISafeUser> {
    const profile = await prismaDb.profile.create({
      data: {
        id: data.id,
        email: data.email,
        username: data.username,
        avatar: data.avatar || null,
        role: 'user',
      },
      include: {
        sellerProfile: true,
      },
    })

    return this.sanitizeProfile(profile)
  }

  /**
   * Find or create profile
   */
  async findOrCreateProfile(userData: {
    id: string
    email: string
    username: string
    avatar?: string | null
  }): Promise<ISafeUser> {
    let profile = await this.findByProfileId(userData.id)

    if (!profile) {
      profile = await this.createProfile(userData)
    }

    return profile
  }

  /**
   * Create seller profile with transaction
   */
  async createSellerProfile(
    profileId: string,
    data: {
      store_name: string
      store_slug: string
      store_description?: string
      store_logo?: string
      store_banner?: string
    }
  ) {
    return prismaDb.$transaction(async (tx) => {
      // Create seller profile
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          profileId,
          store_name: data.store_name,
          store_slug: data.store_slug,
          store_description: data.store_description || null,
          store_logo: data.store_logo || null,
          store_banner: data.store_banner || null,
        },
      })

      // Update user role to seller
      await tx.profile.update({
        where: { id: profileId },
        data: { role: 'seller' },
      })

      return sellerProfile
    })
  }

  /**
   * Get seller by slug
   */
  async getSellerBySlug(slug: string) {
    return prismaDb.sellerProfile.findUnique({
      where: { store_slug: slug },
      include: {
        profile: true,
      },
    })
  }

  /**
   * Sanitize profile data with Zod
   * This ensures NO sensitive data leaks
   */
  private sanitizeProfile(profile: any): ISafeUser {
    // Parse with Zod to strip sensitive fields
    const sanitized = safeUserSchema.parse(profile)
    return sanitized
  }
}

export const authRepository = new AuthRepository()