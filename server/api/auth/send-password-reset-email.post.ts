// FILE PATH: server/layers/auth/api/send-password-reset-email.post.ts

import { defineEventHandler, readBody } from 'h3'
import { getClientIP } from '../../layers/shared/utils/security'
import { ZodError } from 'zod'
import { z } from 'zod'
import { authService } from '../../layers/auth/services/auth.service'

// Simple schema for requesting password reset email
const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address')
})

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = requestPasswordResetSchema.parse(body)

    // Get client info
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    // Request password reset (will send email)
    const result = await authService.requestPasswordReset(
      validatedData.email,
      ipAddress,
      userAgent
    )

    return {
      success: true,
      message: result.message
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors
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
      statusMessage: 'Failed to send password reset email'
    })
  }
})