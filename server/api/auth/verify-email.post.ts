import { defineEventHandler, readBody, createError } from 'h3'
import { ZodError } from 'zod'
import { verifyEmailSchema } from '../../layers/auth/schemas/auth.schemas'
import { authService } from '../../layers/auth/services/auth.service'

export default defineEventHandler(async (event) => {
  try {
    // 1. Parse and validate request body
    const body = await readBody(event)
    const validation = verifyEmailSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.errors
      })
    }

    // 2. Call Singleton Service
    const result = await authService.verifyEmail(validation.data.token)

    return {
      success: true,
      message: result.message
    }

  } catch (error: any) {
    // Handle Zod Errors
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors
      })
    }

    // Handle Service/Auth Errors (e.g. "Invalid Token")
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message
      })
    }

    // Handle Unexpected Errors
    console.error('[Verify Email API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})