// FILE PATH: server/layers/user/api/settings.patch.ts

import { defineEventHandler, readBody } from 'h3'
import { ZodError } from 'zod'
import { updateSettingsSchema } from '../../../layers/profile/schemas/profile.schema'
import { profileService } from '../../../layers/profile/services/profile.service'
import { UserError } from '../../../layers/profile/types/user.types'
import { requireAuth } from '../../../layers/shared/middleware/requireAuth'
import { getClientIP } from '../../../layers/shared/utils/security'


export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = updateSettingsSchema.parse(body)

    // Get client info
    const ipAddress = getClientIP(event)
    const userAgent = event.node.req.headers['user-agent'] || 'Unknown'

    // Initialize service

    // Update settings
    const updated = await profileService.updateSettings(
      user.id,
      validatedData,
      ipAddress,
      userAgent
    )

    return {
      success: true,
      data: updated
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors
      })
    }

    if (error instanceof UserError && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})
