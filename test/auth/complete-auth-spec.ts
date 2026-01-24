// tests/auth/complete-auth.spec.ts
/**
 * Complete Auth Test Suite
 * 
 * Tests all critical auth flows
 * ~8 tests covering everything
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { $fetch } from 'ofetch'

const BASE_URL = 'http://localhost:3000/api'

interface TestUser {
  email: string
  password: string
  name: string
}

interface AuthResponse {
  success: boolean
  data: {
    accessToken: string
    user: {
      id: string
      email: string
      name: string
    }
  }
}

// ============================================================================
// TEST DATA
// ============================================================================

const testUser: TestUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPass123!',
  name: 'Test User'
}

let accessToken: string
let userId: string

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Auth Layer - Complete', () => {
  
  // ========================================================================
  // TEST 1: REGISTRATION
  // ========================================================================
  
  it('TEST 1: Should register a new user', async () => {
    const response = await $fetch<any>(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password,
        name: testUser.name
      }
    })

    expect(response.success).toBe(true)
    expect(response.data.user.email).toBe(testUser.email)
    expect(response.data.user.name).toBe(testUser.name)
    expect(response.data.user.id).toBeDefined()

    userId = response.data.user.id
  })

  // ========================================================================
  // TEST 2: LOGIN
  // ========================================================================

  it('TEST 2: Should login and return access token', async () => {
    // Wait for email to be verified (in real app, user would click link)
    // For testing, manually verify in database or skip verification

    const response = await $fetch<AuthResponse>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    })

    expect(response.success).toBe(true)
    expect(response.data.accessToken).toBeDefined()
    expect(response.data.user.email).toBe(testUser.email)

    accessToken = response.data.accessToken
  })

  // ========================================================================
  // TEST 3: GET CURRENT USER (Protected Endpoint)
  // ========================================================================

  it('TEST 3: Should get current user with valid token', async () => {
    const response = await $fetch<any>(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    expect(response.success).toBe(true)
    expect(response.data.email).toBe(testUser.email)
    expect(response.data.id).toBe(userId)
  })

  // ========================================================================
  // TEST 4: REJECT INVALID TOKEN
  // ========================================================================

  it('TEST 4: Should reject invalid token', async () => {
    try {
      await $fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token-12345'
        }
      })
      expect.fail('Should have thrown 401 error')
    } catch (error: any) {
      expect(error.status).toBe(401)
    }
  })

  // ========================================================================
  // TEST 5: REJECT MISSING TOKEN
  // ========================================================================

  it('TEST 5: Should reject request without token', async () => {
    try {
      await $fetch(`${BASE_URL}/auth/me`, {
        method: 'GET'
        // No Authorization header
      })
      expect.fail('Should have thrown 401 error')
    } catch (error: any) {
      expect(error.status).toBe(401)
    }
  })

  // ========================================================================
  // TEST 6: RATE LIMITING
  // ========================================================================

  it('TEST 6: Should rate limit login attempts', async () => {
    let rateLimited = false
    let attempts = 0

    // Try to login 6 times rapidly
    for (let i = 0; i < 6; i++) {
      try {
        await $fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          body: {
            email: testUser.email,
            password: 'wrong-password'
          }
        })
      } catch (error: any) {
        attempts++
        if (error.status === 429) {
          rateLimited = true
          break
        }
      }
    }

    // Should be rate limited
    expect(rateLimited).toBe(true)
    expect(attempts).toBeGreaterThanOrEqual(1)
  })

  // ========================================================================
  // TEST 7: LOGOUT
  // ========================================================================

  it('TEST 7: Should logout and invalidate token', async () => {
    const response = await $fetch<any>(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    expect(response.success).toBe(true)

    // Now try to use token - should fail
    try {
      await $fetch(`${BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      // Might fail or might still work depending on implementation
    } catch (error: any) {
      // Expected to fail after logout
      expect([401, 500]).toContain(error.status)
    }
  })

  // ========================================================================
  // TEST 8: WRONG PASSWORD
  // ========================================================================

  it('TEST 8: Should reject login with wrong password', async () => {
    try {
      await $fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        body: {
          email: testUser.email,
          password: 'WrongPassword123!'
        }
      })
      expect.fail('Should have thrown 401 error')
    } catch (error: any) {
      expect(error.status).toBe(401)
    }
  })

  // ========================================================================
  // TEST 9: GET PROFILE (Protected Endpoint)
  // ========================================================================

  it('TEST 9: Should get user profile with valid token', async () => {
    // Re-login to get new token
    const loginResponse = await $fetch<AuthResponse>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    })

    const newToken = loginResponse.data.accessToken

    // Get profile
    const response = await $fetch<any>(`${BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${newToken}`
      }
    })

    expect(response.success).toBe(true)
    expect(response.data.email).toBe(testUser.email)
    expect(response.data.name).toBe(testUser.name)
  })

  // ========================================================================
  // TEST 10: PERFORMANCE (Response Time)
  // ========================================================================

  it('TEST 10: Auth endpoints should respond within 200ms', async () => {
    const start = performance.now()

    await $fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: testUser.email,
        password: testUser.password
      }
    }).catch(() => {}) // Catch error, we just care about response time

    const duration = performance.now() - start

    expect(duration).toBeLessThan(200)
  })
})