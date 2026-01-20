// server/api/auth/forgot-password.post.ts
/**
 * Forgot password endpoint
 * - Generates password reset tokens
 * - Validates email existence (constant-time)
 * - Sends reset email
 * - Logs attempts
 */

import { prisma } from '../../utils/db'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { getClientIp, getUserAgent } from '../../utils/security/errors'
import { validateCsrfToken } from '../../utils/security/csrf'
import { checkRateLimit, rateLimitConfig } from '../../utils/auth/rateLimiter'
import crypto from 'crypto'
import type { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    // CSRF Protection
    validateCsrfToken(event)

    // Rate limiting (per IP, generous limit)
    checkRateLimit(ipAddress, {
      maxAttempts: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      lockoutMs: 15 * 60 * 1000, // 15 minutes
      keyPrefix: 'auth:forgot-password',
    })

    const { email } = await readBody(event)

    if (!email || typeof email !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Email is required',
      })
    }

    // Constant-time check to prevent timing attacks
    const startTime = Date.now()
    const user = await prisma.profile.findUnique({
      where: { email },
    })

    // Timing safe delay
    const minTime = 150
    const elapsed = Date.now() - startTime
    if (elapsed < minTime) {
      await new Promise((resolve) => setTimeout(resolve, minTime - elapsed))
    }

    // Log regardless of success (don't leak if email exists)
    if (user) {
      // Generate reset token (32 bytes = 64 hex chars)
      const resetToken = crypto.randomBytes(32).toString('hex')

      // Store token in database with expiration (15 minutes)
      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token: resetToken,
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
        },
      })

      // Log the password reset request
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        userId: user.id,
        email,
        ipAddress,
        userAgent,
        success: true,
      })

      // Send reset email
      await sendPasswordResetEmail(email, resetToken, user.username || 'User')
    } else {
      // Log attempt for non-existent email (for monitoring)
      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: 'User not found',
      })
    }

    // Always return success (don't leak if email exists)
    return {
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent.',
    }
  } catch (error: any) {
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    console.error('Forgot password error:', {
      error: error.message,
      ipAddress,
    })

    await logAuditEvent({
      eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
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

/**
 * Send password reset email
 * TODO: Integrate with your email service (SendGrid, AWS SES, etc.)
 */
async function sendPasswordResetEmail(email: string, token: string, username: string) {
  try {
    const resetUrl = `${process.env.NUXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`

    // Example: SendGrid integration
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = require('@sendgrid/mail')
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)

      const msg = {
        to: email,
        from: process.env.SENDER_EMAIL || 'noreply@reelcart.app',
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${username},</p>
          <p>We received a request to reset your password. Click the link below to proceed:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link expires in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>ReelCart Team</p>
        `,
      }

      await sgMail.send(msg)
    }
    // Add other email providers as needed
  } catch (error) {
    console.error('Failed to send password reset email:', error)
    // Don't throw - email failure shouldn't break the flow
  }
}
