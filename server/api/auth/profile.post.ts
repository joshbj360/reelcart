
import { z } from 'zod'
import { safeUserSchema } from '../../utils/auth/auth.schema'
import { requireAuth } from '../../utils/auth/auth.utils'
import { userRepository } from '~~/server/database/repositories/user.repository'

const createSellerSchema = z.object({
  store_name: z.string().min(3, 'Store name must be at least 3 characters'),
  store_slug: z.string().min(3, 'Store slug must be at least 3 characters'),
  store_description: z.string().optional(),
  store_logo: z.string().url().optional(),
  store_banner: z.string().url().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Validate request body
  const body = await readBody(event)
  const validation = createSellerSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message,
    })
  }

  // Check if user already has seller profile
  if (user.sellerProfile) {
    throw createError({
      statusCode: 400,
      message: 'Seller profile already exists',
    })
  }

  // Create seller profile
  //await authRepository.createSellerProfile(user.id, validation.data)

  // Fetch updated user
  const updatedUser = await userRepository.findById(user.id)

  // Sanitize response
  const safeUser = safeUserSchema.parse(updatedUser)

  return { user: safeUser }
})

