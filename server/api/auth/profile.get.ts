import { safeUserSchema } from '../../utils/auth/auth.schema'
import { requireAuth } from '../../utils/auth/auth.utils'

export default defineEventHandler(async (event) => {
  // 1. Require authentication
  const user = await requireAuth(event)

  // 2. Sanitize with Zod before returning
  const safeUser = safeUserSchema.parse(user)

  return { user: safeUser }
})