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
import { randomBytes } from 'crypto'

export const authRepository = {


  /**
   * Create email verification token
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex')

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
    const token = randomBytes(32).toString('hex')

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
    await prisma.passwordResetToken.updateMany({
      where: {
        user_id: record.user_id,
        id: { not: record.id },
        used_at: null,
      },
      data: { used_at: new Date() },
    })
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

  /**
  * Create session
  */
  async createSession(data: {
    userId: string
    refreshToken: string
    refreshTokenHash: string
    ip: string
    userAgent: string
    device?: string
    country?: string
  }): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.session.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshTokenHash,
        ip: data.ip,
        userAgent: data.userAgent,
        device: data.device,
        country: data.country,
        expiresAt,
        lastUsedAt: new Date()
      }
    })
  },

  /**
  * Get user sessions
  */
  async getUserSessions(userId: string): Promise<any[]> {
    return await prisma.session.findMany({
      where: {
        userId,
        revokedAt: null
      },
      select: {
        id: true,
        device: true,
        country: true,
        ip: true,
        userAgent: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true
      },
      orderBy: { lastUsedAt: 'desc' }
    })
  },

  /**
   * Revoke session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() }
    })
  },

  /**
   * Revoke all sessions for user
   */
  async revokeAllSessions(userId: string): Promise<number> {
    const result = await prisma.session.updateMany({
      where: {
        userId,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    })

    return result.count
  },

  /**
   * Get session by refresh token hash
   * 
   * Used when client sends refresh token to get new access token
   */
  async getSessionByRefreshToken(refreshTokenHash: string): Promise<any | null> {
    return await prisma.session.findUnique({
      where: { refreshToken: refreshTokenHash }
    })
  },

  /**
   * Get session by ID
   * 
   * Used to validate or check session details
   */
  async getSessionById(sessionId: string): Promise<any | null> {
    return await prisma.session.findUnique({
      where: { id: sessionId }
    })
  },

  /**
   * Update session last used time
   * 
   * Called every time token is refreshed or used
   * Track activity to detect dormant sessions
   */
  async updateSessionLastUsed(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() }
    })
  },

  /**
   * Delete expired sessions
   * 
   * Cleanup method - run periodically via cron job
   * Removes sessions older than 7 days
   */
  async deleteExpiredSessions(): Promise<number> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return result.count
  },

  /**
   * Count active sessions for a user
   */
  async countActiveSessions(userId: string): Promise<number> {
    return await prisma.session.count({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      }
    })
  },

  /**
   * Check if a refresh token exists and is valid
   */
  async isRefreshTokenValid(refreshTokenHash: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { refreshToken: refreshTokenHash }
    })

    if (!session) {
      return false
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      return false
    }

    // Check if revoked
    if (session.revokedAt) {
      return false
    }

    return true
  },

  /**
   * Get old sessions for cleanup
   */
  async getOldSessions(daysOld: number = 7): Promise<any[]> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)

    return await prisma.session.findMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    })
  }
}