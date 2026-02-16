// DELETE /api/user/posts/[id]/like - Unlike post
import { getClientIP } from "../../../../layers/shared/utils/security"
import { requireAuth } from "../../../../layers/shared/middleware/requireAuth"
import { contentService } from "../../../../layers/posts/services/post.service"
import { UserError } from "../../../../layers/profile/types/user.types"


export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')
if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)
    
    const ipAddress = getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    
    const result = await contentService.unlikePost(user.id, id, ipAddress, userAgent)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
