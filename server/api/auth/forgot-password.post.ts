import { defineEventHandler, readBody } from 'h3'
import { forgotPasswordSchema } from '../../layers/auth/schemas/auth.schemas'
import { ZodError } from 'zod'
import { authService } from '../../layers/auth/services/auth.service'
import { getClientIP } from '../../layers/shared/utils/security'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = forgotPasswordSchema.parse(body)

    // Get client info
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    // Initialize service

    // Request password reset
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

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})