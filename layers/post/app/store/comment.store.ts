export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Map<string, any>>(new Map())
  const postComments = ref<any[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getCommentById = (id: string) => comments.value.get(id)
  const addComment = (comment: any) => { comments.value.set(comment.id, comment) }
  const setPostComments = (newComments: any[]) => { postComments.value = newComments }
  const addPostComment = (comment: any) => { postComments.value.unshift(comment); comments.value.set(comment.id, comment) }
  const updateComment = (id: string, updates: any) => { const comment = comments.value.get(id); if (comment) comments.value.set(id, { ...comment, ...updates }) }
  const deleteComment = (id: string) => { comments.value.delete(id); postComments.value = postComments.value.filter(c => c.id !== id) }
  const setLoading = (loading: boolean) => { isLoading.value = loading }
  const setError = (err: string | null) => { error.value = err }
  const clearComments = () => { comments.value.clear(); postComments.value = [] }

  return { comments, postComments, isLoading, error, getCommentById, addComment, setPostComments, addPostComment, updateComment, deleteComment, setLoading, setError, clearComments }
})
