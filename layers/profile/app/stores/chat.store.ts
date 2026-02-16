export const useChatStore = defineStore('chat', () => {
  const conversations = ref<any[]>([])
  const currentConversation = ref<any>(null)
  const messages = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getConversationById = (id: string) => conversations.value.find(c => c.id === id)
  const getCurrentMessages = computed(() => messages.value)

  const setConversations = (newConversations: any[]) => { conversations.value = newConversations }
  const addConversation = (conversation: any) => { conversations.value.unshift(conversation) }
  const setCurrentConversation = (conversation: any) => { currentConversation.value = conversation }
  const deleteConversation = (id: string) => { conversations.value = conversations.value.filter(c => c.id !== id) }
  const setMessages = (newMessages: any[]) => { messages.value = newMessages }
  const addMessage = (message: any) => { messages.value.push(message) }
  const setLoading = (loading: boolean) => { isLoading.value = loading }
  const setError = (err: string | null) => { error.value = err }
  const clearChat = () => { conversations.value = []; messages.value = [] }

  return { conversations, currentConversation, messages, isLoading, error, getConversationById, getCurrentMessages, setConversations, addConversation, setCurrentConversation, deleteConversation, setMessages, addMessage, setLoading, setError, clearChat }
})
