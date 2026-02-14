import { BaseApiClient } from '../../../base/app/services/api/base.api'
import type { INotification, IPaginatedResponse } from '../types/profile.types'

export class NotificationApiClient extends BaseApiClient {
  async getNotifications(limit: number = 20, offset: number = 0): Promise<IPaginatedResponse<INotification>> {
    return this.request(`/api/user/notifications?limit=${limit}&offset=${offset}`, { method: 'GET' })
  }
  
  async markAsRead(id: string): Promise<any> {
    return this.request(`/api/user/notifications/${id}`, { method: 'PATCH' })
  }
  
  async markAllAsRead(): Promise<any> {
    return this.request('/api/user/notifications/read-all', { method: 'PATCH' })
  }
}

let instance: NotificationApiClient | null = null
export const useNotificationApi = () => {
  if (!instance) instance = new NotificationApiClient()
  return instance
}