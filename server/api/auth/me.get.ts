// server/api/auth/me.get.ts
/**
 * Get Current User
 * 
 * GET /api/auth/me
 * 
 * Returns the authenticated user's profile
 */

import { defineEventHandler, createError } from 'h3'
import { requireAuth } from '../../middleware/auth'

export default defineEventHandler(async (event) => {
  try {
    // Authenticate user
    const user = await requireAuth(event)

    return {
      success: true,
      data: user
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get user'
    })
  }
})