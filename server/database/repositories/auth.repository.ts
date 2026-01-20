// server/database/repositories/auth.repository.ts
/**
 * Auth Repository
 * 
 * Database operations for authentication
 * Includes methods for:
 * - User profiles
 * - Email verification
 * - Password reset tokens
 * - Audit logging
 */

import { Profile } from '~~/prisma/generated/client'
import { prismaClient as prisma } from '../client'

export const authRepository = {
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
  async findById(id: string): Promise<Profile | null> {
    return prisma.profile.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
      },
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
      email?: string
    }
  ): Promise<Profile | null> {
    return prisma.profile.update({
      where: { id },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.email && { email: data.email.toLowerCase() }),
      },
      include: {
        sellerProfile: true,
      },
    })
  },

  /**
   * Create email verification token
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')

    await prisma.emailVerificationToken.create({
      data: {
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    return token
  },

  /**
   * Verify email token
   */
  async verifyEmailToken(token: string): Promise<string | null> {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    })

    if (!record) {
      return null
    }

    // Check if expired
    if (new Date() > record.expires_at) {
      // Delete expired token
      await prisma.emailVerificationToken.delete({
        where: { token },
      })
      return null
    }

    // Check if already used
    if (record.used_at) {
      return null
    }

    // Mark as used
    await prisma.emailVerificationToken.update({
      where: { token },
      data: { used_at: new Date() },
    })

    return record.user_id
  },

  /**
   * Create password reset token
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex')

    await prisma.passwordResetToken.create({
      data: {
        user_id: userId,
        token,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    })

    return token
  },

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<string | null> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!record) {
      return null
    }

    // Check if expired
    if (new Date() > record.expires_at) {
      return null
    }

    // Check if already used
    if (record.used_at) {
      return null
    }

    return record.user_id
  },

  /**
   * Mark password reset token as used and invalidate others
   */
  async usePasswordResetToken(token: string): Promise<void> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!record) {
      return
    }

    // Mark this token as used
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { used_at: new Date() },
    })

    // Invalidate other unused tokens for this user
    await prisma.passwordResetToken.updateMany(
      {
        where: {
          user_id: record.user_id,
          id: { not: record.id },
          used_at: null,
        },
      },
      { used_at: new Date() }
    )
  },

  /**
   * Check if email is verified in Supabase
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    // This would require a Supabase admin call
    // For now, we check if email verification token exists and hasn't been used
    const token = await prisma.emailVerificationToken.findFirst({
      where: {
        user_id: userId,
        used_at: { not: null },
      },
    })

    return !!token || process.env.REQUIRE_EMAIL_VERIFICATION === 'false'
  },

  /**
   * Get failed login attempts
   */
  async getFailedAttempts(email: string): Promise<any | null> {
    return prisma.failedLoginAttempt.findUnique({
      where: { email: email.toLowerCase() },
    })
  },

  /**
   * Increment failed login attempts
   */
  async incrementFailedAttempts(
    email: string,
    ipAddress?: string
  ): Promise<any> {
    return prisma.failedLoginAttempt.upsert({
      where: { email: email.toLowerCase() },
      update: {
        attempt_count: { increment: 1 },
        last_attempt_at: new Date(),
      },
      create: {
        email: email.toLowerCase(),
        ip_address: ipAddress,
        attempt_count: 1,
        last_attempt_at: new Date(),
      },
    })
  },

  /**
   * Clear failed login attempts
   */
  async clearFailedAttempts(email: string): Promise<any> {
    return prisma.failedLoginAttempt.delete({
      where: { email: email.toLowerCase() },
    }).catch(() => null) // Ignore if doesn't exist
  },

  /**
   * Lock account
   */
  async lockAccount(email: string, lockoutUntil: Date): Promise<any> {
    return prisma.failedLoginAttempt.upsert({
      where: { email: email.toLowerCase() },
      update: {
        locked_until: lockoutUntil,
      },
      create: {
        email: email.toLowerCase(),
        attempt_count: 5,
        locked_until: lockoutUntil,
        last_attempt_at: new Date(),
      },
    })
  },

  /**
   * Check if account is locked
   */
  async isAccountLocked(email: string): Promise<boolean> {
    const attempt = await prisma.failedLoginAttempt.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!attempt?.locked_until) {
      return false
    }

    // Check if lock has expired
    if (new Date() > attempt.locked_until) {
      // Clear the lock
      await this.clearFailedAttempts(email)
      return false
    }

    return true
  },

  /**
   * Get all audit logs for user
   */
  async getUserAuditLogs(userId: string, limit: number = 50): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    })
  },

  /**
   * Get audit logs by event type
   */
  async getAuditLogsByEvent(
    eventType: string,
    limit: number = 100
  ): Promise<any[]> {
    return prisma.auditLog.findMany({
      where: { event_type: eventType },
      orderBy: { created_at: 'desc' },
      take: limit,
    })
  },

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date()

    // Delete expired email verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: {
        expires_at: { lt: now },
      },
    })

    // Delete expired password reset tokens
    await prisma.passwordResetToken.deleteMany({
      where: {
        expires_at: { lt: now },
      },
    })
  },
}