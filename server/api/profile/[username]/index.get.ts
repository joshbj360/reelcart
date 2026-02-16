// GET /api/user/@[username] - Get public profile
import { UserError } from "../../../layers/profile/types/user.types"
import { profileRepository } from "../../../layers/profile/repositories/profile.repository"

export default defineEventHandler(async (event) => {
  try {
     const username = getRouterParam(event, 'username')
    if (!username) {
      throw new UserError('INVALID_USERNAME', 'Username is required', 400)
    }
    const profile = await profileRepository.findByUsername(username)
    
    if (!profile) {
      throw new UserError('USER_NOT_FOUND', `User @${username} not found`, 404)
    }
    
    return { success: true, data: profile }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
