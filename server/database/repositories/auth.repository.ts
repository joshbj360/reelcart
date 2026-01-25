// server/database/repositories/auth.repository.ts
/**
 * Auth Repository
 * 
 * ONLY handles authentication-related database operations:
 * - Email verification tokens
 * - Password reset tokens
 * - Failed login attempts & account lockout
 * - Audit logging
 * - Session management (tracking only)
 * 
 * Seller-related operations moved to: seller.repository.ts
 * User profile operations: user.repository.ts
 */

import { prismaClient as prisma } from '../client'
import { randomBytes } from 'crypto'

export const authRepository = {

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

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

  // ============================================
  // PASSWORD RESET
  // ============================================

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

  // ============================================
  // FAILED LOGIN ATTEMPTS & ACCOUNT LOCKOUT
  // ============================================

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
    }).catch(() => null)
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
      await this.clearFailedAttempts(email)
      return false
    }

    return true
  },

  // ============================================
  // AUDIT LOGGING
  // ============================================

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

    await prisma.emailVerificationToken.deleteMany({
      where: {
        expires_at: { lt: now },
      },
    })

    await prisma.passwordResetToken.deleteMany({
      where: {
        expires_at: { lt: now },
      },
    })
  },

  // ============================================
  // SESSION MANAGEMENT (for tracking only)
  // ============================================

  /**
   * Create session (for tracking only - not auth validation)
   */
  async createSession(data: {
    userId: string
    refreshToken: string
    ip: string
    userAgent: string
    device?: string
    country?: string
  }): Promise<void> {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.session.create({
      data: {
        userId: data.userId,
        refreshToken: data.refreshToken,
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
   * Get session by refresh token
   */
  async getSessionByRefreshToken(refreshToken: string): Promise<any | null> {
    return await prisma.session.findUnique({
      where: { refreshToken }
    })
  },

  /**
   * Get session by ID
   */
  async getSessionById(sessionId: string): Promise<any | null> {
    return await prisma.session.findUnique({
      where: { id: sessionId }
    })
  },

  /**
   * Update session last used time
   */
  async updateSessionLastUsed(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastUsedAt: new Date() }
    })
  },

  /**
   * Delete expired sessions
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