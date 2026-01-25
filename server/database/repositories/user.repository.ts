// server/database/repositories/user.repository.ts
/**
 * User Repository
 * 
 * Database operations for user profiles
 * Middleware and services call this, not Prisma directly
 */

import { prisma } from '../../utils/db'

export const userRepository = {
  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.profile.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        sellerProfile: true,
      },
    })
  },

  /**
   * Find user by ID (partial profile)
   */
  async findById(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        role: true,
      }
    })
  },

  /**
   * Find user by ID with full profile
   */
  async findByIdFull(id: string) {
    return prisma.profile.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
      }
    })
  },

  /**
   * Get full user profile
   */
  async getFullProfile(userId: string) {
    return await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        sellerProfile: true,
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
  }) {
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
      bio?: string
      role?: string
    }
  ) {
    return prisma.profile.update({
      where: { id },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.bio && { bio: data.bio }),
        ...(data.role && { role: data.role }),
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
  },

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.profile.findUnique({
      where: { email: email.toLowerCase() }
    })
    return !!user
  },

  /**
   * Check if username exists
   */
  async usernameExists(username: string): Promise<boolean> {
    const user = await prisma.profile.findFirst({
      where: { username }
    })
    return !!user
  }
}