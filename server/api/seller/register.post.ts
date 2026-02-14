// FILE PATH: server/layers/seller/api/register.post.ts

import { defineEventHandler, readBody } from 'h3'
import { createSellerProfileSchema } from '../../layers/seller/schemas/seller.schema'
import { requireAuth } from '../../layers/shared/middleware/requireAuth'
import { ZodError } from 'zod'
import { sellerService } from '../../layers/seller/services/seller.services'

export default defineEventHandler(async (event) => {
  try {
    // Verify authentication
    const user = await requireAuth(event)

    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = createSellerProfileSchema.parse(body)
    // Create seller profile
    const seller = await sellerService.createSellerProfile(user.id, validatedData)

    return {
      success: true,
      message: 'Seller profile created successfully',
      data: seller
    }
  } catch (error) {
    if (error instanceof ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: error.errors
      })
    }

    if (error instanceof Error && error.message.includes('SellerError')) {
      const sellerError = error as any
      throw createError({
        statusCode: sellerError.statusCode || 400,
        statusMessage: error.message
      })
    }

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create seller profile'
    })
  }
})