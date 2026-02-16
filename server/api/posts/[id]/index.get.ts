// GET /api/user/posts/[id] - Get post by ID
import { contentService } from "../../../layers/posts/services/post.service"
import { UserError } from "../../../layers/profile/types/user.types"
import { chatService } from "../../../layers/profile/services/chat.service"


export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)
    const result = await contentService.getPostById(id)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
