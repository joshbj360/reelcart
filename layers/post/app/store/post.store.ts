// layers/post/app/stores/post.store.ts

export const usePostStore = defineStore('post', () => {
  const posts = ref<Map<string, any>>(new Map()) // Master record of all posts
  const userPosts = ref<Map<string, string[]>>(new Map()) // { 'testuser': ['id1', 'id2'] }
  const savedPostIds = ref<string[]>([])
  const likedPostIds = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getPostById = (id: string) => posts.value.get(id)
  const getPostsByUsername = (username: string) => {
    const ids = userPosts.value.get(username) || []
    return ids.map(id => posts.value.get(id)).filter(Boolean)
  }
  const mySavedPosts = computed(() => {
    return savedPostIds.value.map(id => posts.value.get(id)).filter(Boolean)
  })

  // Actions
  const addPosts = (newPosts: any[], username?: string) => {
    newPosts.forEach(post => posts.value.set(post.id, post))
    
    if (username) {
      const existingIds = userPosts.value.get(username) || []
      const newIds = newPosts.map(p => p.id)
      // Merge unique IDs to prevent duplicates during pagination
      userPosts.value.set(username, [...new Set([...existingIds, ...newIds])])
    }
  }

  const deletePost = (id: string, username?: string) => {
    posts.value.delete(id)
    if (username) {
      const ids = userPosts.value.get(username) || []
      userPosts.value.set(username, ids.filter(postId => postId !== id))
    }
  }

  const setSavedPosts = (newPosts: any[]) => {
    newPosts.forEach(post => posts.value.set(post.id, post))
    savedPostIds.value = newPosts.map(p => p.id)
  }

  const addSavedPosts = (newPosts: any[]) => {
    newPosts.forEach(post => posts.value.set(post.id, post))
    const newIds = newPosts.map(p => p.id)
    savedPostIds.value = [...new Set([...savedPostIds.value, ...newIds])]
  }

  const removeSavedPost = (postId: string) => {
    savedPostIds.value = savedPostIds.value.filter(id => id !== postId)
  }

  // Liked posts
  const isPostLiked = (postId: string) => likedPostIds.value.has(postId)
  const setLikedPosts = (ids: string[]) => { likedPostIds.value = new Set(ids) }
  const addLikedPost = (postId: string) => { likedPostIds.value.add(postId) }
  const removeLikedPost = (postId: string) => { likedPostIds.value.delete(postId) }

  return {
    posts, userPosts, isLoading, error,
    getPostById, getPostsByUsername,
    addPosts, deletePost,
    setLoading: (val: boolean) => isLoading.value = val,
    setError: (val: string | null) => error.value = val,

    savedPostIds,
    mySavedPosts,
    setSavedPosts,
    addSavedPosts,
    removeSavedPost,

    likedPostIds,
    isPostLiked,
    setLikedPosts,
    addLikedPost,
    removeLikedPost
  }
})