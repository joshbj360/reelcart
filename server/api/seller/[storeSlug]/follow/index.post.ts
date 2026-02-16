// server/api/seller/[storeSlug]/follow.post.ts

import { socialService } from "~~/server/layers/profile/services/social.service"
import { requireAuth } from "~~/server/layers/shared/middleware/requireAuth"


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

    // Follow seller
    const result = await socialService.followSeller(
      currentUser.id,
      storeSlug,
      ipAddress,
      userAgent
    )

    return {
      success: true,
      message: 'Store followed successfully',
      data: result
    }
  } catch (error: any) {
    console.error('Follow seller error:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to follow store'
    })
  }
})