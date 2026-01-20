import { serverSupabaseClient } from '#supabase/server'
import { registerSchema } from '../../utils/auth/auth.schema'
import { authRepository } from '../../database/repositories/auth.repository'
import { validateCsrfToken } from '../../utils/security/csrf'
import { checkRateLimit, rateLimitConfig } from '../../utils/auth/rateLimiter'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { throwAuthError, AuthErrorCode, getClientIp, getUserAgent } from '../../utils/security/errors'
import { validatePasswordStrength } from '../../utils/auth/passwordValidator'

export default defineEventHandler(async (event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    // CSRF Protection
    validateCsrfToken(event)

    // Rate limiting
    checkRateLimit(ipAddress, rateLimitConfig.register)

    // Validate body
    const body = await readBody(event)
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: validation.error.errors[0].message,
      })
    }

    const { email, password, username } = validation.data

    // Password strength validation
    const passwordCheck = validatePasswordStrength(password, email)
    if (!passwordCheck.valid) {
      throw createError({
        statusCode: 400,
        message: passwordCheck.errors.join(', '),
      })
    }

    // Check if email already exists
    const existing = await authRepository.findByEmail(email)
    if (existing) {
      await logAuditEvent({
        eventType: AuditEventType.REGISTER_FAILED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Email already exists',
      })

      // Don't reveal if email exists
      throw createError({
        statusCode: 400,
        message: 'Invalid request',
      })
    }

    // Register with Supabase
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username: username || email.split('@')[0] },
        emailRedirectTo: `${getRequestURL(event).origin}/auth/verify-email`,
      },
    })

    if (error) {
      throw createError({
        statusCode: 400,
        message: 'Registration failed. Please try again.',
      })
    }

    // Create profile
    await authRepository.createProfile({
      id: data.user!.id,
      email,
      username: username || email.split('@')[0],
    })

    // Log successful registration
    await logAuditEvent({
      eventType: AuditEventType.REGISTER_SUCCESS,
      userId: data.user!.id,
      email,
      ipAddress,
      userAgent,
      success: true,
    })

    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      user: { id: data.user!.id, email },
    }
  } catch (error: any) {
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    console.error('Register error:', error)

    throw createError({
      statusCode: 500,
      message: 'An error occurred. Please try again later.',
    })
  }
})