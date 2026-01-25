// layers/auth/middleware/auth.global.ts - UPDATED
/**
 * Global Auth Middleware
 * 
 * Runs on every route to check authentication
 * Protected routes require meta.requiresAuth = true
 */

import { defineNuxtRouteMiddleware, navigateTo } from "#app"
import { useAuthStore } from "../stores/auth.store"

export default defineNuxtRouteMiddleware(async (to, from) => {
  // Only check auth for protected routes
  if (!to.meta.requiresAuth) {
    return
  }

  const authStore = useAuthStore()

  // Check if already loaded
  if (authStore.userProfile) {
    return
  }

  // Already loading
  if (authStore.isLoading) {
    return
  }

  try {
    // Fetch user profile
    await authStore.fetchUserProfile()

    if (!authStore.userProfile) {
      // Not logged in - redirect to login
      return navigateTo('/user-login')
    }

    // Fetch seller profiles if user is a seller
    if (authStore.isSeller) {
      try {
        await authStore.fetchSellerProfiles()
      } catch (error: any) {
        console.warn('Failed to fetch seller profiles:', error.message)
        // Don't fail the navigation if seller profiles fail to load
      }
    }
  } catch (error: any) {
    console.error('Failed to fetch user profile:', error.message)
    authStore.reset()
    return navigateTo('/user-login')
  }
})