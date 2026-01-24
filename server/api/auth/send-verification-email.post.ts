// server/api/auth/send-verification-email.post.ts
/**
 * Send verification email endpoint
 * 
 * POST /api/auth/send-verification-email
 * Body: { email: string, token: string }
 */

import { sendVerificationEmail } from '../../utils/email/emailService'

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
    const config = useRuntimeConfig()
    const appUrl = process.env.APP_URL || 'http://localhost:3000'

    const result = await sendVerificationEmail(email, token, appUrl)

    return {
      success: true,
      message: 'Verification email sent',
      emailId: result.id,
    }
  } catch (error: any) {
    console.error('Failed to send verification email:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send verification email',
    })
  }
})