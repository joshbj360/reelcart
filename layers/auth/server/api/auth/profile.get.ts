import { requireAuth } from '../../utils/auth.utils.js'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  
  // ✅ Return ONLY safe user data (no Supabase internals)
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      created_at: user.created_at,
      sellerProfile: user.sellerProfile ? {
        id: user.sellerProfile.id,
        store_name: user.sellerProfile.store_name,
        store_slug: user.sellerProfile.store_slug,
        is_verified: user.sellerProfile.is_verified,
        followers_count: user.sellerProfile.followers_count,
      } : null,
    },
  }
})