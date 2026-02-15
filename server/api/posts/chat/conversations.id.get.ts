// GET /api/user/conversations/[id] - Get conversation
import { getClientIP } from "../../../layers/shared/utils/security"
import { requireAuth } from "../../../layers/shared/middleware/requireAuth"
import { UserError } from "../../../layers/profile/types/user.types"
import { chatService } from "../../../layers/profile/services/chat.service"

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')
if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)
    
    const result = await chatService.getConversation(id, user.id)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
