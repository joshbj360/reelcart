// server/middleware/csrf-init.ts
/**
 * CSRF Token Initialization Middleware
 * 
 * Generates and sets CSRF token on first request
 */

import { generateCsrfToken } from '../utils/security/csrf'

export default defineEventHandler(async (event) => {
  // Only for GET requests (page loads)
  if (event.node.req.method !== 'GET') {
    return
  }

  // Get or generate CSRF token
  let token = getHeader(event, 'x-csrf-token')
  
  if (!token) {
    token = generateCsrfToken() // Generate new token
    
    // Set as cookie
    setCookie(event, '__csrf_token', token, {
      httpOnly: false, // Client needs to read it
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  // Also set as response header so client can grab it
  setHeader(event, 'X-CSRF-Token', token)
})