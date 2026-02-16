// FILE PATH: server/layers/user/repositories/notification.repository.ts

/**
 * Notification Repository
 * Database queries for notifications
 */

export const notificationRepository = {

  async createNotification(data: any) {
    return await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        actorId: data.actorId,
        postId: data.resourceId,
        message: data.message,
        read: data.read || false
      }
    })
  },

  async getNotificationById(notificationId: number) {
    return await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { actor: true }
    })
  },

  async getNotificationsByUserId(userId: string, limit: number, offset: number) {
    return await prisma.notification.findMany({
      where: { userId },
      include: { actor: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    })
  },

  async getNotificationsCountByUserId(userId: string) {
    return await prisma.notification.count({
      where: { userId }
    })
  },

  async getUnreadCountByUserId(userId: string) {
    return await prisma.notification.count({
      where: { userId, read: false }
    })
  },

  async updateNotification(notificationId: number, data: any) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data,
      include: { actor: true }
    })
  },

  async markAllAsReadByUserId(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })
  },

  async deleteNotification(notificationId: number) {
    return await prisma.notification.delete({
      where: { id: notificationId }
    })
  }
}