import { useAuthStore } from '../stores/auth.store'
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // Auto-fetch user if not loaded yet
  if (!authStore.user && !authStore.loading) {
    await authStore.fetchUserProfile()
  }
})