// layers/auth/app/plugins/auth-init.ts

import { useProfileStore } from "~~/layers/profile/app/stores/profile.store"
import { useAuthStore } from "../stores/auth.store"



/**
 * Auth Initialization Plugin
 * Runs on app startup to initialize auth state
 */

export default defineNuxtPlugin(async (nuxtApp) => {
  const profileStore = useProfileStore()
  const authStore = useAuthStore()

  // Initialize auth from localStorage on app startup
  authStore.initializeAuth()

  return {
    provide: {
      auth: {
        isLoggedIn: () => profileStore.isLoggedIn,
        user: () => profileStore.me,
      }
    }
  }
})