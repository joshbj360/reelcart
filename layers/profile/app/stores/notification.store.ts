export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<any[]>([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getUnreadNotifications = computed(() => notifications.value.filter(n => !n.read))

  const setNotifications = (newNotifications: any[]) => { notifications.value = newNotifications; updateUnreadCount() }
  const addNotification = (notification: any) => { notifications.value.unshift(notification); updateUnreadCount() }
  const markAsRead = (id: string) => { const n = notifications.value.find(n => n.id === id); if (n) n.read = true; updateUnreadCount() }
  const updateUnreadCount = () => { unreadCount.value = notifications.value.filter(n => !n.read).length }
  const deleteNotification = (id: string) => { notifications.value = notifications.value.filter(n => n.id !== id) }
  const setLoading = (loading: boolean) => { isLoading.value = loading }
  const setError = (err: string | null) => { error.value = err }
  const clearNotifications = () => { notifications.value = []; unreadCount.value = 0 }

  return { notifications, unreadCount, isLoading, error, getUnreadNotifications, setNotifications, addNotification, markAsRead, updateUnreadCount, deleteNotification, setLoading, setError, clearNotifications }
})
