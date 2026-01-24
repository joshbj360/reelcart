// server/api/auth/forgot-password.post.ts (PROPERLY REFACTORED)
/**
 * Forgot Password Endpoint
 * 
 * Keeps ALL original infrastructure:
 * - Prisma database
 * - Audit logging
 * - Crypto tokens
 * 
 * Adds: Resend email service
 */

import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/db'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { sendPasswordResetEmail } from '../../utils/email/emailService'
import crypto from 'crypto'
import { authRepository } from '~~/server/database/repositories/auth.repository'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Email required' 
    })
  }

  try {
    // Check if user exists (but don't leak this info)
   const user = await authRepository.findByEmail(email)

    if (user) {
      // Generate secure reset token
      const token = crypto.randomBytes(32).toString('hex')
      
      // Store token in database
      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token,
          expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      })

      // ✨ RESEND: Send beautiful reset email
      try {
        await sendPasswordResetEmail(email, token)
        console.log(`✅ Password reset email sent to ${email}`)
      } catch (emailError: any) {
        console.error('Failed to send password reset email:', emailError)
        // Log the email failure but don't fail the endpoint
        await logAuditEvent({
          eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
          userId: user.id,
          email,
          success: true,
          reason: 'Token created but email send failed',
        })
      }

      // Log successful password reset request
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        userId: user.id,
        email,
        success: true,
      })
    } else {
      // Log failed attempt (user not found)
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        email,
        success: false,
        reason: 'User not found',
      })
    }

    // Always return success (don't leak if email exists)
    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    }
  } catch (error: any) {
    console.error('Forgot password error:', error)
    
    // Log the error
    await logAuditEvent({
      eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
      email,
      success: false,
      reason: error.message,
    })

    throw createError({ 
      statusCode: 500, 
      statusMessage: 'An error occurred while processing your request' 
    })
  }
})