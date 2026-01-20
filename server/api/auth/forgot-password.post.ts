import { prisma } from '../../utils/db'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event)

  if (!email) {
    throw createError({ statusCode: 400, message: 'Email required' })
  }

  try {
    // Check if user exists (but don't leak this info)
    const user = await prisma.profile.findUnique({
      where: { email },
    })

    if (user) {
      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token,
          expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      })

      // Send email (integrate with your email service)
      await sendPasswordResetEmail(email, token)

      await logAuditEvent({
        eventType: AuditEventType.PASSWORD_RESET_REQUESTED,
        userId: user.id,
        email,
        success: true,
      })
    } else {
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
      message: 'If email exists, reset link sent',
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    throw createError({ statusCode: 500, message: 'An error occurred' })
  }
})

async function sendPasswordResetEmail(email: string, token: string) {
  // Implement with your email service (SendGrid, AWS SES, etc.)
  const resetUrl = `${process.env.NUXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`
  // Send email...
}