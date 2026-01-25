// server/api/auth/login.post.ts
/**
 * Enhanced login endpoint with production security
 * Features:
 * - Rate limiting
 * - CSRF protection
 * - Audit logging
 * - Brute force protection
 * - Email verification check
 * - Session tracking (device, IP, location)
 * 
 * NOTE: Does NOT create seller profile - that's separate
 */

import { serverSupabaseClient } from '#supabase/server'
import { loginSchema, safeUserSchema } from '../../utils/auth/auth.schema'
import { authRepository } from '../../database/repositories/auth.repository'
import { checkRateLimit, clearRateLimit, rateLimitConfig } from '../../utils/auth/rateLimiter'
import { validateCsrfToken, csrfProtectionMiddleware } from '../../utils/security/csrf'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { throwAuthError, AuthErrorCode, getClientIp, getUserAgent } from '../../utils/security/errors'
import type { H3Event } from 'h3'
import { userRepository } from '~~/server/database/repositories/user.repository'
import { sessionService } from '~~/server/services/session.service'
import { parseUserAgent } from '../../utils/security/parseUserAgent'
import crypto from 'crypto'

/**
 * Middleware to protect this endpoint
 */
export const csrfProtection = csrfProtectionMiddleware

export default defineEventHandler(async (event: H3Event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    // 1. CSRF Protection
    validateCsrfToken(event)

    // 2. Validate request body
    const body = await readBody(event)
    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: validation.error.errors[0].message,
        data: validation.error.errors,
      })
    }

    const { email, password } = validation.data

    // 3. Rate Limiting - Check before auth attempt
    try {
      const { remaining } = checkRateLimit(email, rateLimitConfig.login)
      setResponseHeader(event, 'X-RateLimit-Remaining', String(remaining))
    } catch (rateLimitError: any) {
      await logAuditEvent({
        eventType: AuditEventType.LOGIN_FAILED_RATE_LIMITED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Rate limit exceeded',
      })
      throw rateLimitError
    }

    // 4. Authenticate with Supabase
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Rate limit after failed attempt
      checkRateLimit(email, rateLimitConfig.login)

      await throwAuthError(AuthErrorCode.INVALID_CREDENTIALS, {
        statusCode: 401,
        email,
        ipAddress,
        userAgent,
        internalDetails: { supabaseError: error.message },
      })
    }

    // 5. Verify user has confirmed email (if enforced)
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      if (!data.user?.confirmed_at) {
        await throwAuthError(AuthErrorCode.EMAIL_NOT_VERIFIED, {
          statusCode: 403,
          email,
          userId: data.user?.id,
          ipAddress,
          userAgent,
        })
      }
    }

    // 6. Fetch/create user profile from database (NO seller profile)
    const profile = await userRepository.findOrCreateProfile({
      id: data.user!.id,
      email: data.user!.email!,
      username: data.user!.user_metadata?.username || email.split('@')[0],
      avatar: data.user!.user_metadata?.avatar_url || null,
    })

    // 7. Create session for tracking (device, IP, location)
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(data.session?.refresh_token || '')
      .digest('hex')

    await sessionService.createSession({
      userId: data.user!.id,
      refreshToken: refreshTokenHash,
      ip: ipAddress,
      userAgent: userAgent,
      device: parseUserAgent(userAgent),
    })

    // 8. Validate response with Zod
    const safeUser = safeUserSchema.parse(profile)

    // 9. Clear rate limit on successful login
    clearRateLimit(email, rateLimitConfig.login.keyPrefix)

    // 10. Log successful login
    await logAuditEvent({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userId: data.user!.id,
      email,
      ipAddress,
      userAgent,
      success: true,
    })

    // 11. Return Supabase tokens ONLY
    return {
      success: true,
      user: safeUser,
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_in: data.session?.expires_in,
      expires_at: data.session?.expires_at,
    }
  } catch (error: any) {
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    console.error('Login endpoint error:', {
      error: error.message,
      stack: error.stack,
      ipAddress,
    })

    await logAuditEvent({
      eventType: AuditEventType.LOGIN_FAILED,
      ipAddress,
      userAgent,
      success: false,
      reason: 'Unexpected error',
    })

    throw createError({
      statusCode: 500,
      message: 'An error occurred. Please try again later.',
      data: {
        code: AuthErrorCode.GENERIC,
      },
    })
  }
})