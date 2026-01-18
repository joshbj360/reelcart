import { authRepository } from "../../../database/repositories/auth.repository"

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug required',
    })
  }

  const seller = await authRepository.getSellerBySlug(slug)

  if (!seller) {
    throw createError({
      statusCode: 404,
      message: 'Seller not found',
    })
  }

  return { seller }
})
