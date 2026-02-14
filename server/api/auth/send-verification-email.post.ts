// FILE PATH: server/layers/auth/api/send-verification-email.post.ts

import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '../../layers/shared/middleware/requireAuth'
import { authService } from '../../layers/auth/services/auth.service'

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await requireAuth(event)

    // Get user email
    const profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { email: true }
    })

    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Send verification email
    const result = await authService.sendVerificationEmail(user.id, profile.email)

    return {
      success: true,
      message: result.message
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message
      })
    }

    if (error instanceof Error && error.message.includes('RATE_LIMIT_EXCEEDED')) {
      throw createError({
        statusCode: 429,
        statusMessage: error.message
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send verification email'
    })
  }
})