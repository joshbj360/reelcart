// server/repositories/ProfileRepository.ts
import { db } from '../../../../server/database/client'
import type { Prisma } from '~~/prisma/generated/client'
import type { IProfile, ISellerProfile } from '../../types/auth.types'
import type { AuthRepositoryInterface } from '../repository-Interface/auth.repository.interface'

export class AuthRepository implements AuthRepositoryInterface {
  /**
   * Find profile by email
   */
  async findByEmail(email: string): Promise<IProfile | null> {
    const profile = await db.profile.findUnique({
      where: { email },
      include: { sellerProfile: true },
    })
    return profile as IProfile | null
  }

  /**
   * Find profile by ID with seller profile included
   */
  async findProfileById(id: string): Promise<IProfile | null> {
    if (!id) {
      throw new Error("No user ID provided to findProfileById")
    }
    const profile = await db.profile.findUnique({
      where: { id },
      include: { sellerProfile: true },
    })
    return profile as IProfile | null
  }

  /**
   * Create a basic user profile
   */
  async createProfile(data: Partial<IProfile>): Promise<IProfile> {
    const profile = await db.profile.create({
      data: {
        id: data.id!,
        email: data.email!,
        username: data.username,
        avatar: data.avatar,
        role: data.role || 'user',
      },
      include: { sellerProfile: true },
    })
    return profile as IProfile
  }

  /**
   * Find or create profile (upsert pattern)
   */
  async findOrCreateProfile(userData: Partial<IProfile>): Promise<IProfile> {
    let profile = await this.findProfileById(userData.id!)
    if (!profile) {
      profile = await this.createProfile(userData)
    }
    return profile
  }

  /**
   * Find seller by their unique store slug
   */
  async findSellerBySlug(slug: string): Promise<ISellerProfile | null> {
    const seller = await db.sellerProfile.findUnique({
      where: { store_slug: slug },
      include: { profile: true }
    })
    return seller as ISellerProfile | null
  }

  /**
   * Create seller profile and upgrade user role within a transaction
   */
  async createSellerProfile(profileId: string, data: Partial<Prisma.SellerProfileCreateInput>): Promise<ISellerProfile> {
    // We use db.$transaction. Because db is extended with slugExtension,
    // the 'tx' client will also automatically generate the slug.
    return db.$transaction(async (tx) => {
      // 1. Create the seller profile
      const sellerProfile = await tx.sellerProfile.create({
        data: {
          profileId: profileId,
          store_name: data.store_name!,
          store_description: data.store_description,
          store_logo: data.store_logo,
          store_banner: data.store_banner,
          store_location: data.store_location,
          store_phone: data.store_phone,
          store_website: data.store_website,
          store_socials: data.store_socials|| {},
        }
      })

      // 2. Update user role to seller
      await tx.profile.update({
        where: { id: profileId },
        data: { role: 'seller' }
      })

      return sellerProfile as ISellerProfile
    })
  }
}

export const authRepository = new AuthRepository()