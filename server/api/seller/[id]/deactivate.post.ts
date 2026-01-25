// server/api/seller/[id]/deactivate.post.ts - UPDATED TO USE sellerRepository
import { defineEventHandler, createError, type H3Event } from 'h3'
import { requireAuth } from '../../../utils/auth/auth'
import { sellerRepository } from '../../../database/repositories/seller.repository'
import { logAuditEvent, AuditEventType } from '../../../utils/auth/auditLog'

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await requireAuth(event)
    const sellerId = event.context.params?.id

    if (!sellerId) {
      throw createError({
        statusCode: 400,
        message: 'Seller ID is required',
      })
    }

    const seller = await sellerRepository.getSellerProfile(sellerId)

    if (!seller) {
      throw createError({
        statusCode: 404,
        message: 'Seller profile not found',
      })
    }

    if (seller.profileId !== user.id) {
      throw createError({
        statusCode: 403,
        message: 'You do not have permission to deactivate this seller profile',
      })
    }

    const updatedSeller = await sellerRepository.deactivateSellerProfile(sellerId, user.id)

    await logAuditEvent({
      eventType: AuditEventType.SELLER_PROFILE_CREATED,
      userId: user.id,
      email: user.email,
      success: true,
      reason: 'Seller profile deactivated',
      metadata: {
        seller_id: sellerId,
        store_name: seller.store_name,
        store_slug: seller.store_slug,
      }
    })

    return {
      success: true,
      message: 'Seller profile deactivated successfully',
      seller_id: sellerId,
      is_active: updatedSeller.is_active,
    }
  } catch (error: any) {
    console.error('Deactivate seller profile error:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to deactivate seller profile'
    })
  }
})