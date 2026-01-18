import { serverSupabaseClient } from '#supabase/server';

import { loginSchema, safeUserSchema } from '../../utils/auth/auth.schema'
import { authRepository } from '~~/server/database/repositories/auth.repository'

export default defineEventHandler(async (event) => {
  // 1. Validate request body with Zod
  const body = await readBody(event)
  const validation = loginSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message,
      data: validation.error.errors,
    })
  }

  const { email, password } = validation.data

  try {
    // 2. Authenticate with Supabase
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    })


    if (error) {
      throw createError({
        statusCode: 401,
        message: error.message,
      })
    }

    // 3. Fetch/create user profile from database
    const profile = await authRepository.findOrCreateProfile({
      id: data.user.id,
      email: data.user.email!,
      username: data.user.user_metadata?.username || email.split('@')[0],
      avatar: data.user.user_metadata?.avatar_url || null,
    })

    // 4. Sanitize response with Zod
    const safeUser = safeUserSchema.parse(profile)

    return {
      user: safeUser,
      session: data.session,
    }
  } catch (error: any) {
    console.error('Login error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Login failed',
    })
  }
})