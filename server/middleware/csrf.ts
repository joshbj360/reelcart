// server/middleware/csrf.ts
/**
 * CSRF Protection Middleware
 */

import { validateCsrfToken } from '../utils/security/csrf'

export default defineEventHandler(async (event) => {
  const method = event.node.req.method
  const path = event.node.req.url || ''

  // Only check CSRF for state-changing requests
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  if (!needsCsrf) {
    return
  }

  // Allow login/register without CSRF on first request
  const isAuthEndpoint = path.startsWith('/api/auth/login') || 
                        path.startsWith('/api/auth/register')
  
  if (isAuthEndpoint) {
    // Still validate if token is sent, but don't require it
    const token = getHeader(event, 'x-csrf-token')
    if (token) {
      const valid = validateCsrfToken(event)
      if (!valid) {
        throw createError({
          statusCode: 403,
          statusMessage: 'CSRF token validation failed',
        })
      }
    }
    // If no token sent on login/register, that's okay (first-time users)
    return
  }

  // For other endpoints, CSRF is required
  const token = getHeader(event, 'x-csrf-token')
  if (!token) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF token required',
    })
  }

  const valid = validateCsrfToken(event)
  if (!valid) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF token validation failed',
    })
  }
})