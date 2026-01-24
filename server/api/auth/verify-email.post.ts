// server/api/auth/verify-email.post.ts (PROPER - Using Repository)
/**
 * Verify Email Endpoint
 * Uses auth.repository for token validation (single source of truth)
 */
import { serverSupabaseClient } from '#supabase/server'
import { defineEventHandler, readBody, createError } from 'h3'
import { authRepository } from '../../database/repositories/auth.repository'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'

export default defineEventHandler(async (event) => {
  const { token } = await readBody(event)
  const client = await serverSupabaseClient(event)

  try {
    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token is required',
      })
    }

    // ✨ Use repository to validate token
    // Returns user_id if valid, null if invalid/expired/already-used
    const userId = await authRepository.verifyEmailToken(token)

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid, expired, or already used token',
      })
    }

    // ✨ Mark email as confirmed in Supabase
    const { error: updateError } = await client.auth.admin.updateUserById(
      userId,
      { email_confirm: true }  // Sets confirmed_at automatically
    )

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify email',
      })
    }

    // ✨ Log successful verification
    await logAuditEvent({
      eventType: AuditEventType.EMAIL_VERIFIED,
      userId,
      success: true,
    })

    return {
      success: true,
      message: 'Email verified successfully!',
    }
  } catch (error: any) {
    console.error('Email verification error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Email verification failed',
    })
  }
})