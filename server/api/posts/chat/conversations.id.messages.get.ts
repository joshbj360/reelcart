// GET /api/user/conversations/[id]/messages - Get messages
import { getClientIP } from "../../../layers/shared/utils/security"
import { requireAuth } from "../../../layers/shared/middleware/requireAuth"
import { UserError } from "../../../layers/profile/types/user.types"
import { chatService } from "../../../layers/profile/services/chat.service"

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const id = getRouterParam(event, 'id')
if (!id) throw new UserError('INVALID_ID', 'ID is required', 400)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 50, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)
    
    const result = await chatService.getConversationMessages(id, user.id, limit, offset)
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
