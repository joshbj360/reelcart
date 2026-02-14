// GET /api/user/profile/[id] - Get profile by ID
import { UserError } from "../../../layers/profile/types/user.types"
import { profileRepository } from "../../../layers/profile/repositories/profile.repository"

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)
    const profile = await profileRepository.findById(id)
    
    if (!profile) {
      throw new UserError('USER_NOT_FOUND', 'User not found', 404)
    }
    
    return { success: true, data: profile }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
