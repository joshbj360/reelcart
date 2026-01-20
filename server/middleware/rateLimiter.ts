// server/middleware/rateLimiter.ts
/**
 * Rate Limiting Middleware
 * 
 * Applies rate limiting to sensitive endpoints
 * Checks IP address and email for rate limit violations
 */

import { checkRateLimit, rateLimitConfig } from '../utils/auth/rateLimiter'
import { getClientIp } from '../utils/security/errors'
import { logAuditEvent, AuditEventType } from '../utils/auth/auditLog'

export default defineEventHandler(async (event) => {
  const path = event.node.req.url || ''
  const method = event.node.req.method
  const ipAddress = getClientIp(event.node.req)

  // Paths that need rate limiting
  const rateLimitPaths = [
    {
      pattern: '/api/auth/login',
      config: rateLimitConfig.login,
      identifier: 'email', // Extract from body
    },
    {
      pattern: '/api/auth/register',
      config: rateLimitConfig.register,
      identifier: 'ip', // Use IP address
    },
    {
      pattern: '/api/auth/forgot-password',
      config: { maxAttempts: 10, windowMs: 60 * 60 * 1000, lockoutMs: 15 * 60 * 1000, keyPrefix: 'auth:forgot-password' },
      identifier: 'email',
    },
    {
      pattern: '/api/auth/reset-password',
      config: { maxAttempts: 5, windowMs: 60 * 60 * 1000, lockoutMs: 30 * 60 * 1000, keyPrefix: 'auth:reset-password' },
      identifier: 'ip',
    },
  ]

  // Check if this path needs rate limiting
  const rateLimitRule = rateLimitPaths.find((rule) => path.includes(rule.pattern) && method === 'POST')

  if (!rateLimitRule) {
    return
  }

  try {
    let identifier = ipAddress

    // Extract email from body if needed
    if (rateLimitRule.identifier === 'email') {
      try {
        const body = await readBody(event)
        identifier = body?.email || ipAddress
      } catch {
        // If no body, use IP
        identifier = ipAddress
      }
    }

    // Check rate limit
    const result = checkRateLimit(identifier, rateLimitRule.config)

    // Set rate limit info in response headers
    setResponseHeader(event, 'X-RateLimit-Limit', String(rateLimitRule.config.maxAttempts))
    setResponseHeader(event, 'X-RateLimit-Remaining', String(result.remaining))
    setResponseHeader(event, 'X-RateLimit-Reset', String(result.resetTime))

    // If locked, log and throw error
    if (result.locked) {
      await logAuditEvent({
        eventType: AuditEventType.ACCOUNT_LOCKED,
        email: rateLimitRule.identifier === 'email' ? identifier : undefined,
        ipAddress,
        success: false,
        reason: 'Rate limit exceeded',
      })

      throw createError({
        statusCode: 429,
        message: `Too many attempts. Please try again in ${Math.ceil(result.lockedUntil / 1000)} seconds.`,
        data: {
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(result.lockedUntil / 1000),
        },
      })
    }
  } catch (error: any) {
    if (error.statusCode === 429) {
      throw error
    }

    // Log unexpected errors but don't block
    console.error('Rate limiter error:', {
      path,
      error: error.message,
    })
  }
})