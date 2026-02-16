import { useChatApi } from '../services/chat.api'
import { useChatStore } from '../stores/chat.store'

export const useChat = () => {
  const chatApi = useChatApi()
  const chatStore = useChatStore()

  const isLoading = computed(() => chatStore.isLoading)
  const error = computed(() => chatStore.error)
  const messages = computed(() => chatStore.messages)

  const fetchConversations = async () => {
    chatStore.setLoading(true)
    chatStore.setError(null)
    try {
      const result = await chatApi.getConversations()
      chatStore.setConversations(result.data)
      return result
    } catch (error: any) {
      chatStore.setError(error.message || 'Failed to fetch conversations')
      throw error
    } finally {
      chatStore.setLoading(false)
    }
  }

  const sendMessage = async (conversationId: string, text: string) => {
    try {
      const result = await chatApi.sendMessage(conversationId,text )
      chatStore.addMessage(result)
      return result
    } catch (error: any) {
      chatStore.setError(error.message || 'Failed to send message')
      throw error
    }
  }

  return { isLoading, error, messages, fetchConversations, sendMessage }
}
