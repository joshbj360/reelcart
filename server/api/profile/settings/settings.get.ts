import { defineEventHandler, createError } from 'h3'
import { profileService } from '../../../layers/profile/services/profile.service' // Importing the singleton service
import { requireAuth } from '../../../layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    // 1. Verify Authentication
    // Extracts user from request context
    const user = await requireAuth(event)

    // 2. Call Singleton Service
    // No 'new' keyword. Service handles database interaction.
    const settings = await profileService.getSettings(user.id)

    return {
      success: true,
      data: settings
    }

  } catch (error: any) {
    // Handle Service Errors
    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message
      })
    }

    // Handle Unexpected Errors
    console.error('[Get Settings API] Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})