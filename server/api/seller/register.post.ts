// server/api/seller/register.post.ts - UPDATED TO USE sellerRepository
import { z } from 'zod'
import { requireAuth } from '../../utils/auth/auth'
import { sellerRepository } from '../../database/repositories/seller.repository'
import { defineEventHandler, readBody, createError, type H3Event } from 'h3'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'

const createSellerSchema = z.object({
  store_name: z.string().min(3, 'Store name must be at least 3 characters').max(100),
  store_slug: z.string()
    .min(3, 'Store slug must be at least 3 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Store slug can only contain lowercase letters, numbers, and hyphens'),
  store_description: z.string().max(500).optional(),
  store_logo: z.string().url().optional(),
  store_banner: z.string().url().optional(),
})

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    const validation = createSellerSchema.safeParse(body)

    if (!validation.success) {
      throw createError({
        statusCode: 400,
        message: validation.error.errors[0].message,
      })
    }

    // Check if slug is already taken
    const isSlugTaken = await sellerRepository.isStoreSlugTaken(validation.data.store_slug)
    if (isSlugTaken) {
      throw createError({
        statusCode: 409,
        message: 'Store slug already exists. Please choose a different one.',
      })
    }

    const sellerProfile = await sellerRepository.createSellerProfile(user.id, validation.data)

    await logAuditEvent({
      eventType: AuditEventType.SELLER_PROFILE_CREATED,
      userId: user.id,
      email: user.email,
      success: true,
      metadata: {
        store_name: validation.data.store_name,
        store_slug: validation.data.store_slug,
        seller_id: sellerProfile.id,
      }
    })

    return {
      success: true,
      seller: sellerProfile,
      message: 'Seller profile created successfully',
    }
  } catch (error: any) {
    console.error('Create seller profile error:', error)
    if (error.statusCode) throw error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create seller profile'
    })
  }
})