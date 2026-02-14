// server/api/seller/[storeSlug]/unfollow.delete.ts


import { socialService } from '~~/server/layers/profile/services/social.service'
import { requireAuth } from '~~/server/layers/shared/middleware/requireAuth'

export default defineEventHandler(async (event) => {
  try {
    const storeSlug = getRouterParam(event, 'storeSlug')

    if (!storeSlug) {
      throw createError({
        statusCode: 400,
        message: 'Store slug is required'
      })
    }

    // Get authenticated user
    const currentUser = await requireAuth(event)
    
    if (!currentUser) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized'
      })
    }

    // Get IP and User Agent for audit log
    const ipAddress = getRequestIP(event) || 'unknown'
    const userAgent = getRequestHeader(event, 'user-agent') || 'unknown'

    // Unfollow seller
    const result = await socialService.unfollowSeller(
      currentUser.id,
      storeSlug,
      ipAddress,
      userAgent
    )

    return {
      success: true,
      message: result.message
    }
  } catch (error: any) {
    console.error('Unfollow seller error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to unfollow store'
    })
  }
})