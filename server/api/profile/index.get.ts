// FILE PATH: server/layers/user/api/profile.get.ts

import { defineEventHandler } from 'h3'
import { profileService } from '../../layers/profile/services/profile.service'
import { UserError } from '../../layers/profile/types/user.types'
import { requireAuth } from '../../layers/shared/middleware/requireAuth'


export default defineEventHandler(async (event) => {
  try {
    // Verify user is authenticated
    const user = await requireAuth(event)


    // Get user profile
    const profile = await profileService.getProfile(user.id)

    return {
      success: true,
      data: profile
    }
  } catch (error) {
    if (error instanceof UserError && error.message.includes('UserError')) {
      const userError = error as any
      throw createError({
        statusCode: userError.statusCode || 400,
        statusMessage: error.message
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error' + error //TODO: remove
    })
  }
})
