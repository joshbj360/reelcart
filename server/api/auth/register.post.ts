import { defineEventHandler, readBody, setCookie } from 'h3'
import { authService } from '../../layers/auth/services/auth.service'
import { registerSchema } from '../../layers/auth/schemas/auth.schemas'
import { ZodError } from 'zod'
import { getClientIP } from '../../layers/shared/utils/security'

export default defineEventHandler(async (event) => {
   console.log('🔍 Register endpoint called') //TODO remove this
  try {
    // Parse and validate request body
    const body = await readBody(event)
     console.log('📦 Body received:', body)
    const validatedData = registerSchema.parse(body)

    // Get client info
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    // Initialize service

    // Perform registration
    const result = await authService.register(
      validatedData.email,
      validatedData.username,
      validatedData.password,
      ipAddress,
      userAgent
    )

    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: result
    }
  } catch (error) {
    console.error('❌ Register error:', error)
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors
      })
    }

    if (error instanceof Error && error.message.includes('AuthError')) {
      const authError = error as any
      throw createError({
        statusCode: authError.statusCode || 400,
        statusMessage: error.message
      })
    }
    console.error('❌ Register error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error' + error // TODO: remove error from message in production
    })
  }
})