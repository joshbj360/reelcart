// POST /api/user/posts - Create post

import { contentService } from "~~/server/layers/posts/services/post.service"
import { UserError } from "~~/server/layers/profile/types/user.types"
import { requireAuth } from "~~/server/layers/shared/middleware/requireAuth"
import { getClientIP } from "~~/server/layers/shared/utils/security"


export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    
    const ipAddress = getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    

    if (body.postId && typeof body.postId !== 'string') {
      throw new UserError('INVALID_POST', 'PostId must be a valid string', 400)
    }
    const result = await contentService.savePost(user.id, body.postId, ipAddress, userAgent)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' + error.message }) //TODO: Remove error message in production
  }
})
