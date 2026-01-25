// server/middleware/auth.ts
/**
 * Auth Middleware
 * 
 * IMPORTANT: This middleware ONLY validates Supabase tokens
 * It does NOT use custom tokens - those are for tracking only
 * 
 * Flow:
 * 1. Extract Bearer token from Authorization header
 * 2. Validate with Supabase: serverSupabaseClient.auth.admin.getUser(token)
 * 3. Fetch full user profile from database
 * 4. Set event.context.user for downstream handlers
 */

import { defineEventHandler, createError, getHeader, type H3Event } from 'h3'
import { userRepository } from '../../database/repositories/user.repository'

/**
 * Require authentication
 * Throws 401 if not authenticated
 */
export async function requireAuth(event: H3Event) {
  try {
    // 1. Get auth header
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - No token provided'
      })
    }

    // 2. Extract token (remove "Bearer " prefix)
    const token = authHeader.slice(7)

    // 3. Verify token with Supabase admin API
    const supabase = await serverSupabaseClient(event)
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid token'
      })
    }

    // 4. Fetch full user profile from database
    const user = await userRepository.findByIdFull(data.user.id)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found'
      })
    }

    // 5. Set user in event context for downstream handlers
    event.context.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      role: user.role,
      sellerProfile: user.sellerProfile || null,
    }

    return event.context.user
  } catch (error: any) {
    // If already an HTTP error, re-throw
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('[Auth Middleware] Unexpected error:', error.message)

    // Generic error (don't expose internal details)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication failed'
    })
  }
}

/**
 * Optional auth - doesn't throw if not authenticated
 * Returns user if authenticated, null if not
 */
export async function optionalAuth(event: H3Event) {
  try {
    return await requireAuth(event)
  } catch {
    return null
  }
}

/**
 * Get current user from event context
 * Call this after requireAuth has set context.user
 */
export function getCurrentUser(event: H3Event) {
  return event.context.user || null
}