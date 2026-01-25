// server/services/session.service.ts
/**
 * Session Service
 * 
 * Manages user sessions for tracking only
 * Authentication is handled by Supabase
 * 
 * This service:
 * - Creates session records for device tracking
 * - Manages multi-device sessions
 * - Provides device management (revoke sessions)
 * - Does NOT handle token validation
 */

import { authRepository } from '../../server/database/repositories/auth.repository'

export interface CreateSessionInput {
  userId: string
  refreshToken: string
  ip: string
  userAgent: string
  device?: string
  country?: string
}

export const sessionService = {
  /**
   * Create a new session after user login
   * 
   * This just records the session for tracking/analytics
   * Actual token validation is done by Supabase
   */
  async createSession(input: CreateSessionInput): Promise<void> {
    try {
      await authRepository.createSession({
        userId: input.userId,
        refreshToken: input.refreshToken,
        ip: input.ip,
        userAgent: input.userAgent,
        device: input.device,
        country: input.country
      })

      console.log(`[SessionService] Session created for user ${input.userId}`)
    } catch (error) {
      console.error('[SessionService] Create session error:', error)
      throw new Error('Failed to create session')
    }
  },

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<any[]> {
    try {
      return await authRepository.getUserSessions(userId)
    } catch (error) {
      console.error('[SessionService] Get user sessions error:', error)
      throw new Error('Failed to get sessions')
    }
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await authRepository.revokeSession(sessionId)
      console.log(`[SessionService] Session ${sessionId} revoked`)
    } catch (error) {
      console.error('[SessionService] Revoke session error:', error)
      throw new Error('Failed to revoke session')
    }
  },

  /**
   * Revoke all sessions for a user (logout everywhere)
   */
  async revokeAllSessions(userId: string): Promise<number> {
    try {
      const revokedCount = await authRepository.revokeAllSessions(userId)
      console.log(
        `[SessionService] Revoked ${revokedCount} sessions for user ${userId}`
      )
      return revokedCount
    } catch (error) {
      console.error('[SessionService] Revoke all sessions error:', error)
      throw new Error('Failed to revoke all sessions')
    }
  },

  /**
   * Clean up expired sessions
   * Run periodically via cron job
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const deletedCount = await authRepository.deleteExpiredSessions()
      console.log(
        `[SessionService] Cleaned up ${deletedCount} expired sessions`
      )
      return deletedCount
    } catch (error) {
      console.error('[SessionService] Cleanup expired sessions error:', error)
      return 0
    }
  },

  /**
   * Check if session is valid
   */
  async isSessionValid(sessionId: string, ip?: string): Promise<boolean> {
    try {
      const session = await authRepository.getSessionById(sessionId)

      if (!session) {
        return false
      }

      if (new Date() > session.expiresAt) {
        return false
      }

      if (session.revokedAt) {
        return false
      }

      if (ip && session.ip !== ip) {
        return false
      }

      return true
    } catch (error) {
      console.error('[SessionService] Check session valid error:', error)
      return false
    }
  },

  /**
   * Detect suspicious sessions
   * Alerts if many sessions from different IPs/countries
   */
  async getSuspiciousSessions(userId: string): Promise<any[]> {
    try {
      const sessions = await authRepository.getUserSessions(userId)

      if (sessions.length < 2) {
        return []
      }

      const suspicious: any[] = []
      const recentSessions = sessions.slice(0, 3)
      const ips = new Set(recentSessions.map(s => s.ip))

      if (ips.size > 2) {
        suspicious.push(...recentSessions)
      }

      const countries = new Set(
        recentSessions.map(s => s.country).filter(Boolean)
      )

      if (countries.size > 2) {
        suspicious.push(...recentSessions)
      }

      return suspicious
    } catch (error) {
      console.error('[SessionService] Get suspicious sessions error:', error)
      return []
    }
  }
}