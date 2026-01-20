// server/api/auth/reset-password.post.ts
/**
 * Reset password endpoint
 * - Validates reset token
 * - Checks token expiration
 * - Prevents token reuse
 * - Updates password via Supabase
 * - Logs the change
 */

import { serverSupabaseClient } from '#supabase/server'
import { prisma } from '../../utils/db'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { getClientIp, getUserAgent, throwAuthError, AuthErrorCode } from '../../utils/security/errors'
import { validateCsrfToken } from '../../utils/security/csrf'
import { validatePasswordStrength } from '../../utils/auth/passwordValidator'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    // CSRF Protection
    validateCsrfToken(event)

    const { token, password } = await readBody(event)

    if (!token || typeof token !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Reset token is required',
      })
    }

    if (!password || typeof password !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'New password is required',
      })
    }

    // 1. Find and validate the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      await throwAuthError(AuthErrorCode.INVALID_TOKEN, {
        statusCode: 400,
        ipAddress,
        userAgent,
      })
    }

    // 2. Check if token has expired
    if (new Date() > resetToken!.expires_at) {
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_FAILED,
        userId: resetToken!.user_id,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Token expired',
      })

      throw createError({
        statusCode: 400,
        message: 'Reset token has expired. Please request a new one.',
        data: {
          code: AuthErrorCode.INVALID_TOKEN,
        },
      })
    }

    // 3. Check if token has already been used (prevent reuse)
    if (resetToken!.used_at) {
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_FAILED,
        userId: resetToken!.user_id,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Token already used',
        metadata: { suspiciousActivity: true },
      })

      throw createError({
        statusCode: 400,
        message: 'This reset link has already been used. Please request a new one.',
        data: {
          code: AuthErrorCode.INVALID_TOKEN,
        },
      })
    }

    // 4. Validate new password strength
    const user = await prisma.profile.findUnique({
      where: { id: resetToken!.user_id },
    })

    if (!user) {
      throw createError({
        statusCode: 400,
        message: 'User not found',
      })
    }

    const passwordCheck = validatePasswordStrength(password, user.email)
    if (!passwordCheck.valid) {
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_FAILED,
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Weak password',
        metadata: { errors: passwordCheck.errors },
      })

      throw createError({
        statusCode: 400,
        message: 'New password does not meet security requirements',
        data: {
          code: AuthErrorCode.WEAK_PASSWORD,
          errors: passwordCheck.errors,
        },
      })
    }

    // 5. Update password in Supabase
    const client = await serverSupabaseClient(event)
    const { error: updateError } = await client.auth.admin.updateUserById(
      resetToken!.user_id,
      { password }
    )

    if (updateError) {
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_FAILED,
        userId: user.id,
        email: user.email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Supabase update failed',
        metadata: { supabaseError: updateError.message },
      })

      throw createError({
        statusCode: 500,
        message: 'Failed to update password. Please try again.',
      })
    }

    // 6. Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken!.id },
      data: { used_at: new Date() },
    })

    // 7. Log successful password reset
    await logAuditEvent({
      eventType: AuditEventType.PASSWORD_RESET_SUCCESS,
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
      success: true,
    })

    // 8. Invalidate all other reset tokens for this user (security best practice)
    await prisma.passwordResetToken.updateMany(
      {
        where: {
          user_id: user.id,
          id: { not: resetToken!.id },
          used_at: null,
        },
      },
      { used_at: new Date() } // Mark as used to prevent further use
    )

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    }
  } catch (error: any) {
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    console.error('Reset password error:', {
      error: error.message,
      ipAddress,
    })

    await logAuditEvent({
      eventType: AuditEventType.PASSWORD_RESET_FAILED,
      ipAddress,
      userAgent,
      success: false,
      reason: 'Unexpected error',
    })

    throw createError({
      statusCode: 500,
      message: 'An error occurred. Please try again later.',
    })
  }
})
