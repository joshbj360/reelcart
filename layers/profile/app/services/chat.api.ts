import { BaseApiClient } from '../../../base/app/services/base.api'
import type { IConversation, IMessage, IPaginatedResponse } from '../types/profile.types'

export class ChatApiClient extends BaseApiClient {
  async getConversations(limit: number = 20, offset: number = 0): Promise<IPaginatedResponse<IConversation>> {
    return this.request(`/api/user/conversations?limit=${limit}&offset=${offset}`, { method: 'GET' })
  }
  
  async createConversation(userId: string): Promise<IConversation> {
    return this.request('/api/user/conversations', { method: 'POST', body: { userId } })
  }
  
  async getMessages(conversationId: string, limit: number = 20, offset: number = 0): Promise<IPaginatedResponse<IMessage>> {
    return this.request(`/api/user/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`, { method: 'GET' })
  }
  
  async sendMessage(conversationId: string, text: string): Promise<IMessage> {
    return this.request(`/api/user/conversations/${conversationId}/messages`, { method: 'POST', body: { text } })
  }
}

let instance: ChatApiClient | null = null
export const useChatApi = () => {
  if (!instance) instance = new ChatApiClient()
  return instance
}