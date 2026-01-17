// import { defineNuxtPlugin, refreshNuxtData } from "nuxt/app";
// import { useAuthStore } from "../stores/auth.store";
// import { watch } from "vue";

// import { eventBus } from '../../base/utils/eventBus'

// export default defineNuxtPlugin(() => {
//   const authStore = useAuthStore()
//   const supabase = useSupabaseClient()
  
//   // Track previous user to detect login/logout
//   let previousUserId: string | null = null

//   // ========== WATCH AUTH STORE CHANGES ==========
//   watch(() => authStore.userProfile, async (newUser, oldUser) => {
//     const currentUserId = newUser?.value?.id || null

//     // LOGIN DETECTED
//     if (currentUserId && !previousUserId) {
//       console.log('🔐 Auth Plugin: Login detected')

//       // Required: Merge cart
//       try {
//         const { useCartStore } = await import('~/layers/commerce/stores/cart.store')
//         const cartStore = useCartStore()
//         await cartStore.mergeAndSyncCartOnLogin()
//         console.log('✅ Auth Plugin: Cart merged')
//       } catch (error) {
//         console.error('❌ Auth Plugin: Cart merge failed:', error)
//       }

//       // Optional: Refresh layout data
//       await refreshNuxtData('layout-data')
//       console.log('✅ Auth Plugin: Layout data refreshed')

//       // Optional: Start notification listener
//       if (currentUserId) {
//         const { useNotificationStore } = await import('~/layers/notifications/stores/notification.store')
//         const notificationStore = useNotificationStore()
//         notificationStore.listenForNotifications(currentUserId)
//         console.log('✅ Auth Plugin: Notifications listener started')
//       }

//       // ✅ Emit event for optional listeners
//       eventBus.emit('auth:login', {
//         userId: currentUserId,
//         timestamp: Date.now(),
//       })
//     }

//     // LOGOUT DETECTED
//     if (!currentUserId && previousUserId) {
//       console.log('🔓 Auth Plugin: Logout detected')

//       // Clear all stores
//       try {
//         const { useCartStore } = await import('~/layers/commerce/stores/cart.store')
//         const { useLikeStore } = await import('~/layers/social/stores/like.store')
//         const { useFollowStore } = await import('~/layers/social/stores/follow.store')
//         const { useNotificationStore } = await import('~/layers/notifications/stores/notification.store')

//         const cartStore = useCartStore()
//         const likeStore = useLikeStore()
//         const followStore = useFollowStore()
//         const notificationStore = useNotificationStore()

//         cartStore.reset()
//         likeStore.reset()
//         followStore.reset()
//         notificationStore.reset()
        
//         console.log('✅ Auth Plugin: All stores reset')
//       } catch (error) {
//         console.error('❌ Auth Plugin: Store reset failed:', error)
//       }

//       // ✅ Emit event for optional listeners
//       eventBus.emit('auth:logout', {
//         timestamp: Date.now(),
//       })
//     }

//       // Refresh layout data
//       await refreshNuxtData('layout-data')
//       console.log('✅ Auth Plugin: Layout data refreshed')
      
//       previousUserId = currentUserId
//     }
// )

//   // ========== SUPABASE AUTH STATE CHANGE LISTENER ==========
//   supabase.auth.onAuthStateChange(async (event: string, session: any) => {
//     console.log('🔔 Supabase Auth Event:', event)

//     if (event === 'SIGNED_IN') {
//       console.log('📝 Fetching user profile after Supabase sign-in...')
//       await authStore.fetchUserProfile()
//     }

//     if (event === 'SIGNED_OUT') {
//       console.log('🧹 Clearing user profile after Supabase sign-out...')
//       authStore.userProfile.value = null
//     }
//   })

//   // ========== INITIALIZE ON MOUNT ==========
//   if (import.meta.client) {
//     if (authStore.isLoggedIn && authStore.userProfile) {
//       previousUserId = authStore.userProfile.value?.id || null
//     }
//   }
// })
