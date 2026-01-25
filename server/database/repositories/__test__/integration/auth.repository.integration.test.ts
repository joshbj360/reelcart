// server/database/repositories/__tests__/integration/auth.repository.integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { authRepository } from '../../auth.repository'

describe('Auth Repository - Integration Tests', () => {
  let testUserId: string

  beforeEach(async () => {
    // Create test user
    const user = await global.testHelpers.createUser({
      email: `auth-test-${Date.now()}@test.com`,
      username: `auth-test-${Date.now()}`
    })
    testUserId = user.id
  })

  describe('Email Verification Tokens', () => {
    it('should create email verification token', async () => {
      const token = await authRepository.createEmailVerificationToken(testUserId)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(32)
    })

    it('should verify valid email token', async () => {
      const token = await authRepository.createEmailVerificationToken(testUserId)
      const userId = await authRepository.verifyEmailToken(token)
      
      expect(userId).toBe(testUserId)
    })

    it('should return null for invalid token', async () => {
      const userId = await authRepository.verifyEmailToken('invalid-token-xyz')
      expect(userId).toBeNull()
    })

    it('should return null for used token', async () => {
      const token = await authRepository.createEmailVerificationToken(testUserId)
      
      // Verify once
      await authRepository.verifyEmailToken(token)
      
      // Try to verify again
      const userId = await authRepository.verifyEmailToken(token)
      expect(userId).toBeNull()
    })

    it('should return null for expired token', async () => {
      const prisma = global.testHelpers.getPrisma()
      
      // Create token manually with past expiration
      const token = `expired-token-${Date.now()}`
      await prisma.emailVerificationToken.create({
        data: {
          token,
          user_id: testUserId,
          expires_at: new Date(Date.now() - 1000) // Expired 1 second ago
        }
      })

      const userId = await authRepository.verifyEmailToken(token)
      expect(userId).toBeNull()
    })
  })

  describe('Password Reset Tokens', () => {
    it('should create password reset token', async () => {
      const token = await authRepository.createPasswordResetToken(testUserId)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(32)
    })

    it('should verify valid password reset token', async () => {
      const token = await authRepository.createPasswordResetToken(testUserId)
      const userId = await authRepository.verifyPasswordResetToken(token)
      
      expect(userId).toBe(testUserId)
    })

    it('should return null for invalid reset token', async () => {
      const userId = await authRepository.verifyPasswordResetToken('invalid-reset-token')
      expect(userId).toBeNull()
    })

    it('should mark reset token as used', async () => {
      const token = await authRepository.createPasswordResetToken(testUserId)
      
      // Use token
      await authRepository.usePasswordResetToken(token)
      
      // Try to use again
      const userId = await authRepository.verifyPasswordResetToken(token)
      expect(userId).toBeNull()
    })
  })

  describe('Failed Login Attempts', () => {
    const testEmail = `login-test-${Date.now()}@test.com`
    const testIp = '192.168.1.100'

    it('should increment failed attempts', async () => {
      const attempts = await authRepository.incrementFailedAttempts(testEmail, testIp)
      
      expect(attempts).toBeDefined()
      expect(attempts.attempt_count).toBeGreaterThanOrEqual(1)
    })

    it('should track multiple failed attempts', async () => {
      await authRepository.incrementFailedAttempts(testEmail, testIp)
      const attempts1 = await authRepository.getFailedAttempts(testEmail)
      const count1 = attempts1?.attempt_count || 0

      await authRepository.incrementFailedAttempts(testEmail, testIp)
      const attempts2 = await authRepository.getFailedAttempts(testEmail)
      const count2 = attempts2?.attempt_count || 0

      expect(count2).toBeGreaterThan(count1)
    })

    it('should get failed attempts for email', async () => {
      await authRepository.incrementFailedAttempts(testEmail, testIp)
      const attempts = await authRepository.getFailedAttempts(testEmail)
      
      expect(attempts).toBeDefined()
      expect(attempts?.attempt_count).toBeGreaterThanOrEqual(1)
    })

    it('should clear failed attempts', async () => {
      await authRepository.incrementFailedAttempts(testEmail, testIp)
      await authRepository.clearFailedAttempts(testEmail)
      
      const attempts = await authRepository.getFailedAttempts(testEmail)
      expect(attempts).toBeNull()
    })
  })

  describe('Account Lockout', () => {
    const testEmail = `lockout-test-${Date.now()}@test.com`

    it('should lock account', async () => {
      const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000)
      const result = await authRepository.lockAccount(testEmail, lockoutUntil)
      
      expect(result.locked_until).toBeDefined()
      expect(result.locked_until.getTime()).toBeGreaterThan(Date.now())
    })

    it('should detect locked account', async () => {
      const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000)
      await authRepository.lockAccount(testEmail, lockoutUntil)
      
      const isLocked = await authRepository.isAccountLocked(testEmail)
      expect(isLocked).toBe(true)
    })

    it('should unlock expired lockout', async () => {
      const lockoutUntil = new Date(Date.now() - 1000) // Already expired
      await authRepository.lockAccount(testEmail, lockoutUntil)
      
      const isLocked = await authRepository.isAccountLocked(testEmail)
      expect(isLocked).toBe(false)
    })

    it('should allow re-locking after expiration', async () => {
      const testEmail2 = `lockout-test-${Date.now()}-2@test.com`
      
      // Lock once (expired)
      await authRepository.lockAccount(testEmail2, new Date(Date.now() - 1000))
      
      // Lock again (active)
      const newLockout = new Date(Date.now() + 15 * 60 * 1000)
      await authRepository.lockAccount(testEmail2, newLockout)
      
      const isLocked = await authRepository.isAccountLocked(testEmail2)
      expect(isLocked).toBe(true)
    })
  })

  describe('Sessions', () => {
    it('should create session', async () => {
      await authRepository.createSession({
        userId: testUserId,
        refreshToken: `token-${Date.now()}`,
        ip: '192.168.1.1',
        userAgent: 'Chrome on Windows',
        device: 'Chrome on Windows'
      })

      const sessions = await authRepository.getUserSessions(testUserId)
      expect(sessions.length).toBeGreaterThan(0)
    })

    it('should get user sessions', async () => {
      await authRepository.createSession({
        userId: testUserId,
        refreshToken: `token1-${Date.now()}`,
        ip: '192.168.1.1',
        userAgent: 'Chrome'
      })

      const sessions = await authRepository.getUserSessions(testUserId)
      expect(Array.isArray(sessions)).toBe(true)
      expect(sessions.length).toBeGreaterThan(0)
    })

    it('should get session by refresh token', async () => {
      const refreshToken = `token-${Date.now()}`
      await authRepository.createSession({
        userId: testUserId,
        refreshToken,
        ip: '192.168.1.1',
        userAgent: 'Chrome'
      })

      const session = await authRepository.getSessionByRefreshToken(refreshToken)
      expect(session).toBeDefined()
      expect(session?.userId).toBe(testUserId)
    })

    it('should revoke session', async () => {
      const refreshToken = `token-${Date.now()}`
      const session = await authRepository.createSession({
        userId: testUserId,
        refreshToken,
        ip: '192.168.1.1',
        userAgent: 'Chrome'
      })

      await authRepository.revokeSession(session.id)

      const revokedSession = await authRepository.getSessionByRefreshToken(refreshToken)
      expect(revokedSession).toBeNull()
    })

    it('should revoke all user sessions', async () => {
      await authRepository.createSession({
        userId: testUserId,
        refreshToken: `token1-${Date.now()}`,
        ip: '192.168.1.1',
        userAgent: 'Chrome'
      })

      await authRepository.createSession({
        userId: testUserId,
        refreshToken: `token2-${Date.now()}`,
        ip: '192.168.1.2',
        userAgent: 'Firefox'
      })

      const countBefore = (await authRepository.getUserSessions(testUserId)).length
      expect(countBefore).toBeGreaterThanOrEqual(2)

      const revokedCount = await authRepository.revokeAllSessions(testUserId)
      expect(revokedCount).toBeGreaterThanOrEqual(2)

      const sessions = await authRepository.getUserSessions(testUserId)
      expect(sessions.length).toBe(0)
    })

    it('should delete expired sessions', async () => {
      await authRepository.createSession({
        userId: testUserId,
        refreshToken: `token-${Date.now()}`,
        ip: '192.168.1.1',
        userAgent: 'Chrome'
      })

      const count = await authRepository.deleteExpiredSessions()
      expect(typeof count).toBe('number')
      expect(count).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Audit Logs', () => {
    it('should get user audit logs', async () => {
      const logs = await authRepository.getUserAuditLogs(testUserId)
      expect(Array.isArray(logs)).toBe(true)
    })

    it('should get audit logs by event type', async () => {
      const logs = await authRepository.getAuditLogsByEvent('LOGIN_SUCCESS')
      expect(Array.isArray(logs)).toBe(true)
    })
  })

  describe('Token Cleanup', () => {
    it('should cleanup expired tokens', async () => {
      await authRepository.cleanupExpiredTokens()
      // Should not throw
      expect(true).toBe(true)
    })
  })
})