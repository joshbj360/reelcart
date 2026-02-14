// DELETE /api/user/follow/@[username] - Unfollow user
import { requireAuth } from "../../../../layers/shared/middleware/requireAuth"
import { socialService } from "../../../../layers/profile/services/social.service"
import { getClientIP } from "../../../../layers/shared/utils/security"
import { UserError } from "../../../../layers/profile/types/user.types"

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
     const username = getRouterParam(event, 'username')
    if (!username) {
      throw new UserError('INVALID_USERNAME', 'Username is required', 400)
    }
    
    const ipAddress = getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    
    const result = await socialService.unfollowUser(user.id, username, ipAddress, userAgent)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
