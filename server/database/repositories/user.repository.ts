// server/repositories/user.repository.ts
/**
 * User Repository
* Database operations for authentication
 * Includes methods for:
 * - User profiles
 * All user-related database operations go here
 * Middleware and services call this, not Prisma directly
 */

import { prisma } from '~/server/utils/db'
import { Profile } from '~~/prisma/generated/client'


interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

interface UserProfileFull extends UserProfile {
  bio: string | null
  phone: string | null
  address: string | null
  createdAt: Date
  updatedAt: Date
}

export const userRepository = {
   /**
     * Find user by email
     */
    async findByEmail(email: string): Promise<Profile | null> {
      return prisma.profile.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          sellerProfile: true,
        },
      })
    },
  
    /**
     * Find user by ID
     */
    async findById(id: string): Promise<Partial<Profile | null>> {
      return prisma.profile.findUnique({
        where: { id: id },
        select: {
          id: true,
          email: true,
          username: true,
          avatar: true
        }
      })
    },
  
    /**
       * Get full user profile
       */
      async getFullProfile(userId: string): Promise<Profile | null> {
        return await prisma.profile.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            username: true,
            avatar: true,
            bio: true,
            phone: true,
            address: true,
            createdAt: true,
            updatedAt: true
          }
        })
      },
  
     /**
   * Create or find user profile
   */
  async findOrCreateProfile(data: {
    id: string
    email: string
    username: string
    avatar: string | null
  }): Promise<Profile> {
    return prisma.profile.upsert({
      where: { id: data.id },
      update: {},
      create: {
        id: data.id,
        email: data.email.toLowerCase(),
        username: data.username,
        avatar: data.avatar,
        role: 'user',
      },
      include: {
        sellerProfile: true,
      },
    })
  },
  
    /**
     * Update user profile
     */
    async updateProfile(
      id: string,
      data: {
        username?: string
        avatar?: string | null
        bio: string
        phone: string
        address: string
      }
    ): Promise<Profile | null> {
      return prisma.profile.update({
        where: { id },
        data: {
          ...(data.username && { username: data.username }),
          ...(data.avatar !== undefined && { avatar: data.avatar }),
          ...(data.bio && { bio: data.bio }),
          ...(data.phone && { phone: data.phone }),
          ...(data.address && { address: data.address }),
        },
        include: {
          sellerProfile: true,
        },
      })
    },
  
    /**
       * Delete user
       */
      async delete(userId: string): Promise<void> {
        await prisma.profile.delete({
          where: { id: userId }
        })
      }
}