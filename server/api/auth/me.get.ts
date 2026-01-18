import { requireAuth } from '../../utils/auth/auth.utils'

export default defineEventHandler(async (event) => {
  // requireAuth automatically throws 401 if not authenticated
  const user = await requireAuth(event)
  
  return { user }
})
