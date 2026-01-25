// server/api/auth/verify-email.post.ts
/**
 * Verify Email Endpoint
 * 
 * POST /api/auth/verify-email
 * Body: { token: string }
 * 
 * Verifies email token and marks email as confirmed in Supabase
 */

import { serverSupabaseClient } from '#supabase/server'
import { defineEventHandler, readBody, createError, type H3Event } from 'h3'
import { authRepository } from '../../database/repositories/auth.repository'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'

export default defineEventHandler(async (event: H3Event) => {
  const { token } = await readBody(event)
  
  try {
    if (!token) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token is required',
      })
    }

    // Validate token using repository
    // Returns user_id if valid, null if invalid/expired/already-used
    const userId = await authRepository.verifyEmailToken(token)

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid, expired, or already used token',
      })
    }

    // Mark email as confirmed in Supabase
    const client = await serverSupabaseClient(event)
    const { error: updateError } = await client.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    )

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify email',
      })
    }

    // Log successful verification
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

    await logAuditEvent({
      eventType: AuditEventType.REGISTER_FAILED,
      success: false,
      reason: error.message,
    })

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Email verification failed',
    })
  }
})