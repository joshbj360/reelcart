// server/api/seller/list.get.ts - UPDATED TO USE sellerRepository
import { defineEventHandler, createError, type H3Event } from 'h3'
import { requireAuth } from '../../utils/auth/auth'
import { sellerRepository } from '../../database/repositories/seller.repository'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await requireAuth(event)

    const sellers = await sellerRepository.getUserSellerProfiles(user.id)

    return {
      success: true,
      sellers,
      count: sellers.length,
      active_count: sellers.filter(s => s.is_active).length,
      inactive_count: sellers.filter(s => !s.is_active).length,
    }
  } catch (error: any) {
    console.error('Get seller profiles error:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get seller profiles'
    })
  }
})