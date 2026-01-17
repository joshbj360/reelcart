import { authRepository } from "~~/layers/auth/database/repositories/auth.repository"

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  if (user.sellerProfile) {
    throw createError({
      statusCode: 400,
      message: 'Seller profile already exists',
    })
  }

  await authRepository.createSellerProfile(user.id, {
    store_name: body.store_name,
    store_description: body.store_description,
    store_slug: body.store_slug,
    store_logo: body.store_logo,
    store_banner: body.store_banner,
    store_location: body.store_location,
    store_phone: body.store_phone,
    store_website: body.store_website,
    store_socials: body.store_socials,
  })

  // Refetch user with updated seller profile
  const updatedUser = await authRepository.findProfileById(user.id)

  return { user: updatedUser }
})