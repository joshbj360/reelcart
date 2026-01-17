import { serverSupabaseClient } from '#supabase/server'
import { authRepository } from '../../../database/repositories/auth.repository'
import { registerSchema } from '../../../utils/auth.schema'
import { transformToSafeUser } from '../../utils/auth.utils'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // 1. Validate Input
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues[0].message,
      data: parsed.error.issues
    })
  }

  const { email, password, username, phone } = parsed.data

  const supabase = await serverSupabaseClient(event)

  // 2. Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getRequestURL(event).origin}/auth/callback`,
      data: {
        username,
        phone
      }
    },
  })

  if (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  if (!data.user) {
    throw createError({
      statusCode: 500,
      message: 'Registration failed: No user returned',
    })
  }

  // 3. Database Sync (Create Profile)
  // We use findOrCreateProfile to be safe, though createProfile would usually suffice.
  const profile = await authRepository.findOrCreateProfile({
    id: data.user.id,
    email: data.user.email!,
    username: username || email.split('@')[0],
    role: 'user',
    // We can add phone if profile supports it, but IProfile doesn't seem to have phone in earlier read files?
    // Let's check IProfile if needed, but for now map what we know.
  })

  // 4. Clean Response
  return {
    success: true,
    user: transformToSafeUser(profile),
  }
})
