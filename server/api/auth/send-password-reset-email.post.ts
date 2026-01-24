// server/api/auth/send-password-reset-email.post.ts
/**
 * Send password reset email endpoint
 * 
 * POST /api/auth/send-password-reset-email
 * Body: { email: string, token: string }
 */

import { sendPasswordResetEmail } from '../../utils/email/emailService'

export default defineEventHandler(async (event) => {
  const { email, token } = await readBody(event)

  // Validate input
  if (!email || !token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and token are required',
    })
  }

  try {
    const appUrl = process.env.APP_URL || 'http://localhost:3000'

    const result = await sendPasswordResetEmail(email, token, appUrl)

    return {
      success: true,
      message: 'Password reset email sent',
      emailId: result.id,
    }
  } catch (error: any) {
    console.error('Failed to send password reset email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send password reset email',
    })
  }
})