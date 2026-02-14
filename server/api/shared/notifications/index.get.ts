// GET /api/user/notifications - Get notifications
import { requireAuth } from "../../../layers/shared/middleware/requireAuth"
import { notificationService } from "../../../layers/profile/services/notification.service"
export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const query = getQuery(event)
    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)
    
    const result = await notificationService.getNotifications(user.userId, limit, offset)
    return { success: true, data: result }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
