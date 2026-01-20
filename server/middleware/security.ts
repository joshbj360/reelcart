import { csrfProtectionMiddleware } from '../utils/security/csrf'
import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  // Apply CSRF protection to state-changing requests
  csrfProtectionMiddleware(event)

  // Add security headers
  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff')
  setResponseHeader(event, 'X-Frame-Options', 'DENY')
  setResponseHeader(event, 'X-XSS-Protection', '1; mode=block')
  
  // Add CORS headers if needed
  if (process.env.NODE_ENV === 'production') {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
})