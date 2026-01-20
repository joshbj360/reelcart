// server/api/auth/register.post.ts
/**
 * Enhanced register endpoint with production security
 * Features:
 * - Rate limiting
 * - CSRF protection
 * - Audit logging
 * - Email uniqueness check
 * - Password strength validation
 * - Email verification token generation
 */

import { serverSupabaseClient } from '#supabase/server'
import { registerSchema } from '../../utils/auth/auth.schema'
import { authRepository } from '../../database/repositories/auth.repository'
import { checkRateLimit, clearRateLimit, rateLimitConfig } from '../../utils/auth/rateLimiter'
import { validateCsrfToken } from '../../utils/security/csrf'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { throwAuthError, AuthErrorCode, getClientIp, getUserAgent } from '../../utils/security/errors'
import { validatePasswordStrength, isPasswordTooSimilarToEmail } from '../../utils/auth/passwordValidator'
import { prisma } from '../../utils/db'
import crypto from 'crypto'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    // 1. CSRF Protection
    validateCsrfToken(event)

    // 2. Rate Limiting - by IP address (prevent spam)
    try {
      const { remaining } = checkRateLimit(ipAddress, rateLimitConfig.register)
      setResponseHeader(event, 'X-RateLimit-Remaining', String(remaining))
    } catch (rateLimitError: any) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Rate limit exceeded',
      })
      throw rateLimitError
    }

    // 3. Validate request body
    const body = await readBody(event)
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: validation.error.errors[0].message,
        data: validation.error.errors,
      })
    }

    const { email, password, username } = validation.data

    // 4. Validate password strength
    const passwordCheck = validatePasswordStrength(password, email)
    if (!passwordCheck.valid) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Weak password',
        metadata: { errors: passwordCheck.errors },
      })

      throw createError({
        statusCode: 400,
        message: 'Password does not meet security requirements',
        data: {
          code: AuthErrorCode.WEAK_PASSWORD,
          errors: passwordCheck.errors,
        },
      })
    }

    // 5. Check if email already exists (prevent enumeration by timing-safe comparison)
    const startTime = Date.now()
    const existing = await authRepository.findByEmail(email)

    // Constant-time operation to prevent timing attacks
    const minTime = 100 // milliseconds
    const elapsed = Date.now() - startTime
    if (elapsed < minTime) {
      await new Promise((resolve) => setTimeout(resolve, minTime - elapsed))
    }

    if (existing) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Email already registered',
      })

      // Don't reveal if email exists (generic error)
      throw createError({
        statusCode: 400,
        message: 'Invalid request. Please check your input.',
        data: {
          code: AuthErrorCode.GENERIC,
        },
      })
    }

    // 6. Register with Supabase
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
        emailRedirectTo: `${getRequestURL(event).origin}/auth/verify-email`,
      },
    })

    if (error) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Supabase registration failed',
        metadata: { supabaseError: error.message },
      })

      throw createError({
        statusCode: 400,
        message: 'Registration failed. Please try again.',
        data: {
          code: AuthErrorCode.GENERIC,
        },
      })
    }

    // 7. Create profile in local database
    const profile = await authRepository.createProfile({
      id: data.user!.id,
      email,
      username: username || email.split('@')[0],
      avatar: null,
    })

    // 8. Generate email verification token
    if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
      const verificationToken = crypto.randomBytes(32).toString('hex')
      await prisma.emailVerificationToken.create({
        data: {
          user_id: data.user!.id,
          token: verificationToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      })

      // In production, send email with verification link
      // await sendVerificationEmail(email, verificationToken)
    }

    // 9. Clear rate limit on successful registration
    clearRateLimit(ipAddress, rateLimitConfig.register.keyPrefix)

    // 10. Log successful registration
    await logAuditEvent({
      eventType: AuditEventType.REGISTER_SUCCESS,
      userId: data.user!.id,
      email,
      ipAddress,
      userAgent,
      success: true,
    })

    // 11. Return safe response
    return {
      success: true,
      message: process.env.REQUIRE_EMAIL_VERIFICATION === 'true'
        ? 'Registration successful. Please check your email to verify your account.'
        : 'Registration successful. You can now log in.',
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
      },
    }
  } catch (error: any) {
    // Don't expose internal errors
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    // Log unexpected errors
    console.error('Register endpoint error:', {
      error: error.message,
      stack: error.stack,
      ipAddress,
    })

    await logAuditEvent({
      eventType: AuditEventType.REGISTER_FAILED,
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
