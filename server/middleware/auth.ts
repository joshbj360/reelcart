// server/middleware/auth.ts
/**
 * Auth Middleware
 * Protects routes and provides user context
 */

import { defineEventHandler, createError, getHeader, H3Event } from 'h3'
import { authRepository } from '../database/repositories/auth.repository'

interface AuthenticatedEvent extends H3Event {
  context: {
    user: {
      id: string
      email: string
      name: string | null
      avatar: string | null
    }
  }
}

/**
 * Require authentication
 * Throws 401 if not authenticated
 */
export async function requireAuth(event: any) {
  try {
    // Get auth header
    const authHeader = getHeader(event, 'authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - No token provided'
      })
    }

    // Extract token
    const token = authHeader.slice(7) // Remove "Bearer "

    // Verify token with Supabase
    const supabase = useSupabaseClient(event)
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Invalid token'
      })
    }

    // Get user profile from database
    const user = await authRepository.findById(data.user.id)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found'
      })
    }

    // Set user in event context
    event.context.user = user

    return user
  } catch (error: any) {
    // If already an HTTP error, re-throw
    if (error.statusCode) {
      throw error
    }

    // Generic error
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
export async function optionalAuth(event: any) {
  try {
    return await requireAuth(event)
  } catch {
    return null
  }
}

/**
 * Get current user from event context
 * Used after middleware has run
 */
export function getCurrentUser(event: any) {
  return event.context.user || null
}