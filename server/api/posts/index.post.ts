// POST /api/user/posts - Create post
import { getClientIP } from "../../layers/shared/utils/security"
import { requireAuth } from "../../layers/shared/middleware/requireAuth"
import { contentService } from "../../layers/posts/services/post.service"
import { UserError } from "../../layers/profile/types/user.types"

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    
    const ipAddress = getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    

    if (body.mediaId && typeof body.mediaId !== 'string') {
      throw new UserError('INVALID_MEDIA', 'mediaId must be a valid string', 400)
    }
    const result = await contentService.createPost(user.id, body, ipAddress, userAgent)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' + error.message }) //TODO: Remove error message in production
  }
})
