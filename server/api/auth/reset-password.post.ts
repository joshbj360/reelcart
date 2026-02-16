import { defineEventHandler, readBody, deleteCookie, createError, getRequestIP, getRequestHeader } from 'h3'
import { authService } from '../../layers/auth/services/auth.service'
import { resetPasswordSchema } from '../../layers/auth/schemas/auth.schemas'
import { ZodError } from 'zod'

export default defineEventHandler(async (event) => {
  try {
    // 1. Parse and validate request body
    const body = await readBody(event)
    const validation = resetPasswordSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: validation.error.errors
      })
    }

    const validatedData = validation.data

    // 2. Get client info safely
    const ipAddress = getRequestIP(event, { xForwardedFor: true }) || '127.0.0.1'
    const userAgent = getRequestHeader(event, 'user-agent') || 'Unknown'

    // 3. Call Singleton Service
    // Logic: Validate Token -> Hash New Password -> Revoke Sessions -> Audit Log
    const result = await authService.resetPassword(
      validatedData.token,
      validatedData.password,
      ipAddress,
      userAgent
    )

    // 4. Clear cookies 
    // Crucial Security Step: Forces the user to log in again with the new password
    deleteCookie(event, 'accessToken')
    deleteCookie(event, 'refreshToken')

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

    // Handle Service/Auth Errors (e.g. "Invalid Token", "Expired Token")
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message
      })
    }

    // Handle Unexpected Errors
    console.error('[Reset Password API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})