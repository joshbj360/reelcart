// layers/auth/middleware/auth.global.ts

import { defineNuxtRouteMiddleware } from "nuxt/app"
import { useAuthStore } from "../stores/auth.store"

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()
  
  // ✅ If we already have a user profile loaded, skip
  if (authStore.userProfile) {
    return
  }

  // ✅ Only run this ONCE on app initialization
  // Check if this is the initial navigation (from is undefined or same route)
  const isInitialLoad = !from.name || (from.name === to.name)
  
  if (!isInitialLoad && authStore.isLoading) {
    // Already attempting to load, skip
    return
  }

  try {
    // ✅ Get Supabase user (this checks session + localStorage)
    const supabaseUser = useSupabaseUser()
    
    if (!supabaseUser.value) {
      // No user logged in
      return
    }

    // ✅ Only fetch profile if we have a Supabase user
    // AND we haven't already tried (or successfully loaded it)
    if (!authStore.isLoading && !authStore.userProfile) {
      await authStore.fetchUserProfile()
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Don't throw - user just isn't authenticated
  }
})