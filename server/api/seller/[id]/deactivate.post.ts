// FILE PATH: server/layers/seller/api/[id]/deactivate.post.ts

import { defineEventHandler } from 'h3'
import { requireAuth } from '../../../layers/shared/middleware/requireAuth'
import { sellerService } from '../../../layers/seller/services/seller.services'

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    const sellerId = getRouterParam(event, 'id')

    if (!sellerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Seller ID is required'
      })
    }


    // Deactivate seller profile
    const seller = await sellerService.deactivateSellerProfile(sellerId, user.id)

    return {
      success: true,
      message: 'Seller profile deactivated successfully',
      data: seller
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('SellerError')) {
      const sellerError = error as any
      throw createError({
        statusCode: sellerError.statusCode || 400,
        statusMessage: error.message
      })
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: 403,
        statusMessage: error.message
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to deactivate seller profile'
    })
  }
})