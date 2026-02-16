// PATCH /api/user/notifications/read-all - Mark all as read
import { requireAuth } from "../../..//layers/shared/middleware/requireAuth"
import { notificationService } from "../../../layers/profile/services/notification.service"

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAuth(event)
    const result = await notificationService.markAllAsRead(user.userId)
    return { success: true, data: result }
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: 'Server error' })
  }
})
