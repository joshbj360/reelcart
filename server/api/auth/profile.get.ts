// server/api/user/profile.get.ts
/**
 * Get User Profile
 * 
 * GET /api/user/profile
 * 
 * Returns authenticated user's profile
 * 
 * Protected: YES (requires auth)
 */

import { defineEventHandler, createError } from 'h3'
import { requireAuth } from '~~/server/middleware/auth'
import { userRepository } from '~~/server/database/repositories/user.repository'

export default defineEventHandler(async (event) => {
  try {
    // Require authentication
    const user = await requireAuth(event)

    const profile = await userRepository.findOrCreateProfile({
      id: user.id,
      email: user.email,
      username: user?.username || 'User_' + Math.floor(Math.random() * 10000),
      avatar: user.avatar || null
    })

    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Profile not found'
      })
    }

    return {
      success: true,
      data: profile
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