// server/utils/auth/rateLimiter.ts
/**
 * Production-grade rate limiting for auth endpoints
 * Prevents brute force attacks and DoS
 */

import { createError } from 'h3'

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number // milliseconds
  lockoutMs: number // milliseconds after max attempts exceeded
  keyPrefix: string
}

interface AttemptRecord {
  count: number
  firstAttemptAt: number
  lockedUntil?: number
}

// In-memory store for rate limiting (use Redis in production cluster)
const attemptStore = new Map<string, AttemptRecord>()

// Cleanup old records every hour
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of attemptStore.entries()) {
    if (now - record.firstAttemptAt > 3600000) {
      attemptStore.delete(key)
    }
  }
}, 3600000)

export const rateLimitConfig = {
  login: {
    maxAttempts: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
    keyPrefix: 'auth:login',
  } as RateLimitConfig,

  register: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    lockoutMs: 60 * 60 * 1000, // 1 hour lockout
    keyPrefix: 'auth:register',
  } as RateLimitConfig,

  profileFetch: {
    maxAttempts: 30,
    windowMs: 60 * 1000, // 1 minute
    lockoutMs: 5 * 60 * 1000, // 5 minutes lockout
    keyPrefix: 'auth:profile',
  } as RateLimitConfig,
}

/**
 * Check rate limit for a key
 * Throws if rate limit exceeded
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { remaining: number; resetAt: number } {
  const key = `${config.keyPrefix}:${identifier}`
  const now = Date.now()
  let record = attemptStore.get(key)

  // Check if account is locked
  if (record?.lockedUntil && record.lockedUntil > now) {
    const remaining = Math.ceil((record.lockedUntil - now) / 1000)
    throw createError({
      statusCode: 429,
      message: `Too many attempts. Please try again in ${remaining} seconds.`,
      data: { retryAfter: remaining },
    })
  }

  // Clear lock if expired
  if (record?.lockedUntil && record.lockedUntil <= now) {
    record.lockedUntil = undefined
    record.count = 0
  }

  // Initialize or update record
  if (!record) {
    record = {
      count: 1,
      firstAttemptAt: now,
    }
  } else if (now - record.firstAttemptAt > config.windowMs) {
    // Window expired, reset
    record = {
      count: 1,
      firstAttemptAt: now,
    }
  } else {
    record.count++
  }

  // Check if exceeded
  if (record.count > config.maxAttempts) {
    record.lockedUntil = now + config.lockoutMs
    attemptStore.set(key, record)

    throw createError({
      statusCode: 429,
      message: 'Too many attempts. Account temporarily locked.',
      data: {
        retryAfter: Math.ceil(config.lockoutMs / 1000),
      },
    })
  }

  attemptStore.set(key, record)

  return {
    remaining: config.maxAttempts - record.count,
    resetAt: record.firstAttemptAt + config.windowMs,
  }
}

/**
 * Clear rate limit for a key (call on successful auth)
 */
export function clearRateLimit(identifier: string, keyPrefix: string) {
  const key = `${keyPrefix}:${identifier}`
  attemptStore.delete(key)
}

/**
 * Get rate limit status for debugging
 */
export function getRateLimitStatus(identifier: string, keyPrefix: string) {
  const key = `${keyPrefix}:${identifier}`
  return attemptStore.get(key)
}
