// FILE PATH: server/layers/user/services/chat.service.ts

/**
 * Chat Service
 * Handles: Conversations and Messages (User-to-User, User-to-Seller, User-to-AI)
 */

import { UserError } from '../types/user.types'
import { chatRepository } from '../repositories/chat.repository'
import { notificationService } from './notification.service'
import { profileRepository } from '../repositories/profile.repository'
import { auditService } from '../../shared/audit/audit.service'

export const chatService = {

  // ==================== CONVERSATIONS ====================

  async createConversation(userId: string, targetId: string, productId?: number, ipAddress?: string, userAgent?: string) {
    // 1. Check for existing conversation
    const existing = await chatRepository.getConversationByParticipants(userId, targetId)
    if (existing) return existing

    // 2. Create new conversation
    const conversation = await chatRepository.createConversation({
      participant1Id: userId,
      participant2Id: targetId,
      currentProductId: productId
    })

    // ALIGNED: Audit Log
    if (ipAddress && userAgent) {
      await auditService.logUserAction({
        userId,
        action: 'CONVERSATION_STARTED',
        resource: 'Conversation',
        resourceId: conversation.id,
        reason: 'User started a new chat',
        changes: { targetId, productId },
        ipAddress,
        userAgent
      })
    }

    return conversation
  },

  async getConversations(userId: string, limit = 20, offset = 0) {
    const conversations = await chatRepository.getConversationsByUserId(userId, limit, offset)
    const total = await chatRepository.getConversationCountByUserId(userId)
    return { conversations, total, limit, offset }
  },

  async getConversation(conversationId: string, userId: string) {
    const conversation = await chatRepository.getConversationById(conversationId)
    if (!conversation) throw new UserError('CONVERSATION_NOT_FOUND', 'Conversation not found', 404)

    // Security: Only participants can view
    if (conversation.participant1Id !== userId && conversation.participant2Id !== userId) {
      throw new UserError('FORBIDDEN', 'Access denied', 403)
    }

    return conversation
  },

  async updateConversationProduct(conversationId: string, userId: string, productId: number, ipAddress: string, userAgent: string) {
    await this.getConversation(conversationId, userId) // Checks existence and permission

    const updated = await chatRepository.updateConversation(conversationId, { currentProductId: productId })
    
    // ALIGNED: Audit Log
    await auditService.logUserAction({
      userId,
      action: 'CONVERSATION_PRODUCT_UPDATED',
      resource: 'Conversation',
      resourceId: conversationId,
      reason: 'Product focus in chat updated',
      changes: { productId },
      ipAddress,
      userAgent
    })
    
    return updated
  },

  async deleteConversation(conversationId: string, userId: string, ipAddress: string, userAgent: string) {
    await this.getConversation(conversationId, userId) // Checks existence and permission

    await chatRepository.deleteConversation(conversationId)
    
    // ALIGNED: Audit Log
    await auditService.logUserAction({
      userId,
      action: 'CONVERSATION_DELETED',
      resource: 'Conversation',
      resourceId: conversationId,
      reason: 'User deleted their copy of the conversation',
      ipAddress,
      userAgent
    })
    
    return { message: 'Conversation deleted successfully' }
  },

  // ==================== MESSAGES ====================

  async sendMessage(conversationId: string, userId: string, text: string, messageType = 'text', ipAddress?: string, userAgent?: string) {
    const conversation = await this.getConversation(conversationId, userId)

    // 1. Create message
    const message = await chatRepository.createMessage({
      conversationId,
      senderId: userId,
      text,
      type: messageType
    })

    // 2. Update conversation timestamp (Brings chat to top of list)
    await chatRepository.updateConversation(conversationId, { lastMessageAt: new Date() })

    // 3. ALIGNED: Audit Log
    if (ipAddress && userAgent) {
      await auditService.logUserAction({
        userId,
        action: 'MESSAGE_SENT',
        resource: 'Message',
        resourceId: message.id,
        reason: 'User sent a chat message',
        ipAddress,
        userAgent
      })
    }

    // 4. ALIGNED: Notification
    const recipientId = conversation.participant1Id === userId ? conversation.participant2Id : conversation.participant1Id
    
    if (recipientId !== 'ai-bot') {
      const sender = await profileRepository.findById(userId)
      
      await notificationService.createNotification({
        userId: recipientId as string,
        type: 'MESSAGE',
        actorId: userId,
        message: `New message from ${sender?.username || 'someone'}`,
        conversationId // Important for frontend deep-linking
      })
    }

    return message
  },

  async getConversationMessages(conversationId: string, userId: string, limit = 50, offset = 0) {
    await this.getConversation(conversationId, userId) // Verify access

    const messages = await chatRepository.getConversationMessages(conversationId, limit, offset)
    const total = await chatRepository.getMessageCountByConversation(conversationId)
    return { messages, total, limit, offset }
  },

  async deleteMessage(messageId: string, userId: string, ipAddress: string, userAgent: string) {
    const message = await chatRepository.getMessageById(messageId)
    if (!message) throw new UserError('MESSAGE_NOT_FOUND', 'Message not found', 404)

    if (message.senderId !== userId) {
      throw new UserError('FORBIDDEN', 'You can only delete your own messages', 403)
    }

    await chatRepository.deleteMessage(messageId)
    
    // ALIGNED: Audit Log
    await auditService.logUserAction({
      userId,
      action: 'MESSAGE_DELETED',
      resource: 'Message',
      resourceId: messageId,
      reason: 'User deleted a sent message',
      ipAddress,
      userAgent
    })
    
    return { message: 'Message deleted successfully' }
  }
}