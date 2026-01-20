// server/middleware/csrf.ts
/**
 * CSRF Protection Middleware
 * 
 * Validates CSRF tokens on state-changing requests (POST, PUT, DELETE)
 * Exempts GET requests and specific endpoints
 */

import { validateCsrfToken } from '../utils/security/csrf'

export default defineEventHandler((event) => {
  const method = event.node.req.method
  const path = event.node.req.url || ''

  // Only validate state-changing requests
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return
  }

  // Exempt specific endpoints that don't need CSRF (e.g., webhooks)
  const exemptPaths = [
    '/api/webhooks/',
    '/api/health',
    '/api/auth/refresh-token', // Refresh token can use Authorization header instead
  ]

  const isExempt = exemptPaths.some((exemptPath) => path.includes(exemptPath))

  if (isExempt) {
    return
  }

  // Validate CSRF token
  try {
    validateCsrfToken(event)
  } catch (error: any) {
    console.error('CSRF validation failed:', {
      path,
      method,
      error: error.message,
    })

    throw createError({
      statusCode: 403,
      message: 'CSRF token validation failed',
      data: {
        code: 'CSRF_VALIDATION_FAILED',
      },
    })
  }
})