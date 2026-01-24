// layers/auth/plugins/auth-lifecycle.client.ts

import { useAuthStore } from "../stores/auth.store"

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore()

  return {
    provide: {
      auth: {
        isAuthenticated: () => !!authStore.userProfile,
        isSeller: () => authStore.userProfile?.role === 'seller',
        getUser: () => authStore.userProfile,
        logout: async () => {
          await authStore.logout()
        },
      },
    },
  }
})