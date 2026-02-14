// FILE PATH: server/utils/auth/jwt.ts

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production'

export interface JWTPayload {
  sub: string // user ID
  email: string
  iat: number
  exp: number
}

/**
 * Generate JWT access token (15 minutes)
 */
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign(
    {
      sub: userId,
      email
    },
    JWT_SECRET,
    {
      expiresIn: '15m',
      algorithm: 'HS256'
    }
  )
}

/**
 * Generate JWT refresh token (7 days)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      sub: userId,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  )
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    })
    return decoded as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { sub: string; type: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      algorithms: ['HS256']
    })
    return decoded as { sub: string; type: string }
  } catch (error) {
    return null
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token)
    return decoded as JWTPayload
  } catch (error) {
    return null
  }
}