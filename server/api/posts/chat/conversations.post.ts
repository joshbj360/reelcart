// POST /api/user/conversations - Create conversation
import { getClientIP } from "../../../layers/shared/utils/security"
import { requireAuth } from "../../../layers/shared/middleware/requireAuth"
import { UserError } from "../../../layers/profile/types/user.types"
import { chatService } from "../../../layers/profile/services/chat.service"


export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const body = await readBody(event)
    
    const ipAddress = getHeader(event, 'x-forwarded-for') || getClientIP(event) || 'unknown'
    const userAgent = getHeader(event, 'user-agent') || 'unknown'
    
    const result = await chatService.createConversation(
      user.id,
      body.targetId,
      body.productId,
      ipAddress,
      userAgent
    )
    return { success: true, data: result }
  } catch (error: any) {
    if (error instanceof UserError) {
      throw createError({ statusCode: error.status, statusMessage: error.message })
    }
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
