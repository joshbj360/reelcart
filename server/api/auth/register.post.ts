import { serverSupabaseClient } from '#supabase/server'
import { authRepository } from '../../database/repositories/auth.repository'
// Location: layers/auth/server/api/auth/register.post.ts

import { registerSchema, safeUserSchema } from '../../utils/auth/auth.schema'

export default defineEventHandler(async (event) => {
  // 1. Validate request body
  const body = await readBody(event)
  const validation = registerSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message,
      data: validation.error.errors,
    })
  }

  const { email, password, username } = validation.data

  try {
    // 2. Check if email already exists
    const existing = await authRepository.findByEmail(email)
    if (existing) {
      throw createError({
        statusCode: 409,
        message: 'Email already registered',
      })
    }

    // 3. Register with Supabase
    const client = await serverSupabaseClient(event)
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${getRequestURL(event).origin}/auth/callback`,
      },
    })

    if (error) {
      throw createError({
        statusCode: 400,
        message: error.message,
      })
    }

    return {
      success: true,
      user: data.user,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Registration failed',
    })
  }
})