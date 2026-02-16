// FILE PATH: server/layers/seller/api/[slug].get.ts

import { defineEventHandler } from 'h3'
import { sellerService } from '../../layers/seller/services/seller.services'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Seller slug is required'
      })
    }


    // Get seller profile by slug (public endpoint)
    const seller = await sellerService.getSellerBySlug(slug)

    return {
      success: true,
      message: 'Seller profile retrieved successfully',
      data: seller
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('SellerError')) {
      const sellerError = error as any
      throw createError({
        statusCode: sellerError.statusCode || 404,
        statusMessage: error.message
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve seller profile'
    })
  }
})