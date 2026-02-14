// FILE PATH: server/layers/user/repositories/chat.repository.ts

export const chatRepository = {

  // ========== CONVERSATIONS ==========
  async createConversation(data: any) {
    return await prisma.conversation.create({
      data: { id: crypto.randomUUID(), ...data }
    })
  },

  async getConversationById(conversationId: string) {
    return await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participant1: true,
        participant2: true,
        currentProduct: true,
        messages: { take: 1, orderBy: { sentAt: 'desc' } }
      }
    })
  },

  async getConversationByParticipants(participant1Id: string, participant2Id: string) {
    return await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id, participant2Id },
          { participant1Id: participant2Id, participant2Id: participant1Id }
        ]
      }
    })
  },

  async getConversationsByUserId(userId: string, limit: number, offset: number) {
    return await prisma.conversation.findMany({
      where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] },
      include: { participant1: true, participant2: true, currentProduct: true },
      take: limit,
      skip: offset,
      orderBy: { updated_at: 'desc' }
    })
  },

  async getConversationCountByUserId(userId: string) {
    return await prisma.conversation.count({
      where: { OR: [{ participant1Id: userId }, { participant2Id: userId }] }
    })
  },

  async updateConversation(conversationId: string, data: any) {
    return await prisma.conversation.update({
      where: { id: conversationId },
      data,
      include: { participant1: true, participant2: true, currentProduct: true }
    })
  },

  async deleteConversation(conversationId: string) {
    return await prisma.conversation.delete({ where: { id: conversationId } })
  },

  // ========== MESSAGES ==========
  async createMessage(data: any) {
    return await prisma.message.create({
      data: { id: crypto.randomUUID(), ...data },
      include: { sender: true }
    })
  },

  async getMessageById(messageId: string) {
    return await prisma.message.findUnique({
      where: { id: messageId },
      include: { sender: true }
    })
  },

  async getConversationMessages(conversationId: string, limit: number, offset: number) {
    return await prisma.message.findMany({
      where: { conversationId },
      include: { sender: true },
      take: limit,
      skip: offset,
      orderBy: { sentAt: 'asc' }
    })
  },

  async getMessageCountByConversation(conversationId: string) {
    return await prisma.message.count({ where: { conversationId } })
  },

  async deleteMessage(messageId: string) {
    return await prisma.message.delete({ where: { id: messageId } })
  }
}