// server/api/auth/profile.get.ts
/**
 * Get Current User Profile
 * 
 * GET /api/auth/profile
 * 
 * Returns authenticated user's complete profile
 * Protected: YES (requires Bearer token)
 */

import { defineEventHandler, createError, type H3Event } from 'h3'
import { requireAuth } from '~~/server/utils/auth/auth'
import { safeUserSchema } from '../../utils/auth/auth.schema'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Authenticate user
    const user = await requireAuth(event)

    // Validate with Zod to ensure safe user structure
    const safeUser = safeUserSchema.parse(user)

    return {
      success: true,
      user: safeUser
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get profile'
    })
  }
})