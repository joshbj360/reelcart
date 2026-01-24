// layers/auth/middleware/auth.global.ts

import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app"
import { useAuthStore } from "../stores/auth.store"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only check auth for protected routes
  if (!to.meta.requiresAuth) {
    return  // Public route - skip auth check
  }

  const authStore = useAuthStore()
  const user = useSupabaseUser()

  if (!user.value) {
    authStore.$reset()
    return navigateTo('/user-login')
  }

  if (authStore.userProfile) {
    return
  }

  if (authStore.isLoading) {
    return
  }

  try {
    await authStore.fetchUserProfile()
  } catch (error: any) {
    console.error('Failed to fetch user profile:', error.message)
    authStore.$reset()
    return navigateTo('/user-login')
  }
})