// server/api/auth/refresh-token.post.ts
/**
 * Refresh authentication token
 * POST /api/auth/refresh-token
 * 
 * Request body:
 * {
 *   refresh_token: string
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   access_token: string
 *   refresh_token: string
 *   expires_in: number
 *   user: SafeUser
 * }
 */

import { serverSupabaseClient } from '#supabase/server'
import { logAuditEvent, AuditEventType } from '../../utils/auth/auditLog'
import { getClientIp, getUserAgent } from '../../utils/security/errors'

export default defineEventHandler(async (event: H3Event) => {
  const ipAddress = getClientIp(event.node.req)
  const userAgent = getUserAgent(event.node.req)

  try {
    const { refresh_token } = await readBody(event)

    if (!refresh_token || typeof refresh_token !== 'string') {
      throw createError({
        statusCode: 400,
        message: 'Refresh token is required',
      })
    }

    // Get Supabase client
    const client = await serverSupabaseClient(event)

    // Exchange refresh token for new access token
    const { data, error } = await client.auth.refreshSession({
      refresh_token,
    })

    if (error || !data.session) {
      await logAuditEvent({
        eventType: AuditEventType.LOGIN_FAILED,
        ipAddress,
        userAgent,
        success: false,
        reason: 'Invalid or expired refresh token',
      })

      throw createError({
        statusCode: 401,
        message: 'Invalid or expired refresh token. Please login again.',
      })
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { id: data.user!.id },
      include: {
        sellerProfile: true,
      },
    })

    // Sanitize user data
    const safeUser = {
      id: data.user!.id,
      email: data.user!.email,
      username: profile?.username || data.user!.user_metadata?.username || data.user!.email?.split('@')[0],
      avatar: profile?.avatar || null,
      role: profile?.role || 'user',
      created_at: profile?.created_at,
      sellerProfile: profile?.sellerProfile || null,
    }

    // Log successful token refresh
    await logAuditEvent({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userId: data.user!.id,
      email: data.user!.email,
      ipAddress,
      userAgent,
      success: true,
      reason: 'Token refreshed',
    })

    return {
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: safeUser,
    }
  } catch (error: any) {
    if (error.statusCode && error.statusCode < 500) {
      throw error
    }

    console.error('Refresh token endpoint error:', {
      error: error.message,
      ipAddress,
    })

    await logAuditEvent({
      eventType: AuditEventType.LOGIN_FAILED,
      ipAddress,
      userAgent,
      success: false,
      reason: 'Unexpected error during token refresh',
    })

    throw createError({
      statusCode: 500,
      message: 'An error occurred. Please try again later.',
    })
  }
})