// server/api/auth/logout.post.ts
/**
 * Logout Endpoint
 * 
 * POST /api/auth/logout
 * 
 * Revokes all sessions for the user (logout everywhere)
 */

import { defineEventHandler, createError, deleteCookie, type H3Event } from 'h3'
import { requireAuth } from '~~/server/utils/auth/auth'
import { sessionService } from '~~/server/services/session.service'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Authenticate user
    const user = await requireAuth(event)

    // Revoke all sessions (logout everywhere)
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