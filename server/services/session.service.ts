// server/services/session.service.ts
/**
 * Session Service
 * 
 * Manages user sessions, refresh tokens, and access tokens
 * Uses repositories for database access (NO direct Prisma)
 */

import crypto from 'crypto'
import { authRepository } from '~~/server/database/repositories/auth.repository'

export interface CreateSessionInput {
  userId: string
  ip: string
  userAgent: string
  device?: string
  country?: string
}

export interface SessionInfo {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

const ACCESS_TOKEN_EXPIRY_MINUTES = 15
const REFRESH_TOKEN_EXPIRY_DAYS = 7

export const sessionService = {
  /**
   * Create a new session after user login
   */
  async createSession(input: CreateSessionInput): Promise<SessionInfo> {
    try {
      // Generate refresh token
      const refreshToken = crypto.randomBytes(32).toString('hex')
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex')

      // Create session using your repository
      await authRepository.createSession({
        userId: input.userId,
        refreshToken,
        refreshTokenHash,
        ip: input.ip,
        userAgent: input.userAgent,
        device: input.device,
        country: input.country
      })

      // Generate access token
      const accessToken = crypto.randomBytes(32).toString('hex')

      return {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_MINUTES * 60,
        tokenType: 'Bearer'
      }
    } catch (error) {
      console.error('[SessionService] Create session error:', error)
      throw new Error('Failed to create session')
    }
  },

  /**
   * Verify refresh token and return new access token
   */
  async refreshAccessToken(
    refreshToken: string,
    ip: string,
    userAgent: string
  ): Promise<SessionInfo | null> {
    try {
      // Hash the token
      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex')

      // Get session from repository
      const session = await authRepository.getSessionByRefreshToken(
        refreshTokenHash
      )

      if (!session) {
        console.warn('[SessionService] Refresh token not found')
        return null
      }

      // Check if expired
      if (new Date() > session.expiresAt) {
        console.warn('[SessionService] Refresh token expired')
        await authRepository.revokeSession(session.id)
        return null
      }

      // Check if revoked
      if (session.revokedAt) {
        console.warn('[SessionService] Refresh token revoked')
        return null
      }

      // SECURITY: Check IP and User Agent match
      if (session.ip !== ip || session.userAgent !== userAgent) {
        console.warn('[SessionService] IP or User Agent mismatch')
        await authRepository.revokeSession(session.id)
        return null
      }

      // Update last used
      await authRepository.updateSessionLastUsed(session.id)

      // Generate new access token
      const accessToken = crypto.randomBytes(32).toString('hex')

      return {
        accessToken,
        refreshToken,
        expiresIn: ACCESS_TOKEN_EXPIRY_MINUTES * 60,
        tokenType: 'Bearer'
      }
    } catch (error) {
      console.error('[SessionService] Refresh access token error:', error)
      return null
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
   * Revoke all sessions for a user
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
  async isSessionValid(
    sessionId: string,
    ip?: string
  ): Promise<boolean> {
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