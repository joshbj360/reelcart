// server/api/auth/logout.post.ts
/**
 * Logout Endpoint
 * 
 * POST /api/auth/logout
 * 
 * Revokes all sessions for the user
 */

import { defineEventHandler, createError, deleteCookie } from 'h3'
import { requireAuth } from '~~/server/middleware/auth'
import { sessionService } from '~~/server/services/session.service'

export default defineEventHandler(async (event) => {
  try {
    // Authenticate user
    const user = await requireAuth(event)

    // Revoke all sessions
    await sessionService.revokeAllSessions(user.id)

    // Clear refresh token cookie
    deleteCookie(event, 'refresh_token')

    return {
      success: true,
      message: 'Logged out successfully'
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Logout failed'
    })
  }
})