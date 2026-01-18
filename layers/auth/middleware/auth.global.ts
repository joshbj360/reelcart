// layers/auth/middleware/auth.global.ts
import { defineNuxtRouteMiddleware } from "nuxt/app"
import { useAuthStore } from "../stores/auth.store"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  const user = useSupabaseUser() // Reactive composable

  // 1. If we have a profile, we are good.
  if (authStore.userProfile) {
    return
  }

  // 2. If no Supabase session exists, we can't fetch a profile anyway.
  if (!user.value) {
    // Optional: If you want to clear the profile when user is null (handle logout edge cases)
    if (authStore.userProfile) {
      authStore.$reset() 
    }
    return
  }

  // 3. Prevent duplicate requests
  // If we are already loading, we let the existing promise finish.
  if (authStore.isLoading) {
    return
  }

  try {
    // 4. Fetch the profile
    // Note: If you want this to be "Non-blocking" for public routes, 
    // you can remove the 'await' and let it run in background, 
    // BUT be careful of race conditions on protected pages.
    await authStore.fetchUserProfile()
    
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Optional: Redirect to login if fetching profile critically fails?
    // return navigateTo('/auth/login')
  }
})