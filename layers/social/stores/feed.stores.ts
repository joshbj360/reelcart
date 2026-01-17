// import { eventBus } from '~base/utils/eventBus'

// export const useFeedStore = defineStore('feed', () => {
//   const posts = ref([])
//   const isLoading = ref(false)

//   async function fetchPersonalizedFeed() {
//     isLoading.value = true
//     try {
//       // Fetch personalized feed
//       const response = await feedApi.getPersonalized()
//       posts.value = response.feed
//     } finally {
//       isLoading.value = false
//     }
//   }

//   function clearFeed() {
//     posts.value = []
//   }

//   // ✅ Listen to auth events (optional feature)
//   if (import.meta.server) {
//     eventBus.on('auth:login', async () => {
//       console.log('🔔 Feed store: User logged in, fetching personalized feed')
//       await fetchPersonalizedFeed()
//     })

//     eventBus.on('auth:logout', () => {
//       console.log('🔔 Feed store: User logged out, clearing feed')
//       clearFeed()
//     })
//   }

//   return {
//     posts,
//     isLoading,
//     fetchPersonalizedFeed,
//     clearFeed,
//   }
// })
