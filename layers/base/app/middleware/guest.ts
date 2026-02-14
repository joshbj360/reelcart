// layers/base/middleware/guest.ts

import { useProfileStore } from "~~/layers/profile/app/stores/profile.store"


/**
 * Guest Middleware
 * Redirects logged-in users away from auth pages
 * 
 * Usage:
 * definePageMeta({
 *   middleware: 'guest'
 * })
 */

export default defineNuxtRouteMiddleware((to, from) => {
const profileStore = useProfileStore()

  // If already logged in, redirect to dashboard
  if (profileStore.isLoggedIn) {
    return navigateTo('/seller/dashboard')
  }
})