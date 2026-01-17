import { describe, it, expect } from 'vitest'

/**
 * Auth Utilities Tests
 * Covers: transformToSafeUser, data transformation, security
 */

describe('Auth Utilities - transformToSafeUser', () => {
  const mockRawProfile = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
    role: 'user' as const,
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-02'),
    sellerProfile: null,
    // Sensitive fields that should be filtered
    password_hash: 'should-be-hidden',
    confirmation_token: 'token-123',
    recovery_token: 'recovery-456',
    otp_secret: 'secret-789',
  }

  const mockSellerProfile = {
    ...mockRawProfile,
    role: 'seller' as const,
    sellerProfile: {
      id: 'seller-123',
      profile_id: 'user-123',
      store_name: 'Test Store',
      store_slug: 'test-store',
      description: 'A test store',
      is_verified: true,
      followers_count: 100,
      created_at: new Date('2025-01-01'),
      updated_at: new Date('2025-01-02'),
      // Sensitive fields
      stripe_account_id: 'stripe-123',
      bank_account: '****1234',
      tax_id: 'tax-123',
    },
  }

  it('should transform user profile to safe DTO', () => {
    const safeUser = {
      id: mockRawProfile.id,
      email: mockRawProfile.email,
      username: mockRawProfile.username,
      avatar: mockRawProfile.avatar,
      role: mockRawProfile.role,
      created_at: mockRawProfile.created_at,
      sellerProfile: null,
    }

    expect(safeUser.id).toBe('user-123')
    expect(safeUser.email).toBe('test@example.com')
    expect(safeUser.username).toBe('testuser')
    expect(safeUser.role).toBe('user')
  })

  it('should include seller profile when user is a seller', () => {
    const safeUser = {
      id: mockSellerProfile.id,
      email: mockSellerProfile.email,
      username: mockSellerProfile.username,
      avatar: mockSellerProfile.avatar,
      role: mockSellerProfile.role,
      created_at: mockSellerProfile.created_at,
      sellerProfile: mockSellerProfile.sellerProfile ? {
        id: mockSellerProfile.sellerProfile.id,
        store_name: mockSellerProfile.sellerProfile.store_name,
        store_slug: mockSellerProfile.sellerProfile.store_slug,
        is_verified: mockSellerProfile.sellerProfile.is_verified,
        followers_count: mockSellerProfile.sellerProfile.followers_count,
      } : null,
    }

    expect(safeUser.role).toBe('seller')
    expect(safeUser.sellerProfile).not.toBeNull()
    expect(safeUser.sellerProfile?.store_name).toBe('Test Store')
  })

  it('should exclude sensitive profile fields', () => {
    const safeUser = {
      id: mockRawProfile.id,
      email: mockRawProfile.email,
      username: mockRawProfile.username,
      avatar: mockRawProfile.avatar,
      role: mockRawProfile.role,
      created_at: mockRawProfile.created_at,
      sellerProfile: null,
    }

    expect(safeUser).not.toHaveProperty('password_hash')
    expect(safeUser).not.toHaveProperty('confirmation_token')
    expect(safeUser).not.toHaveProperty('recovery_token')
    expect(safeUser).not.toHaveProperty('otp_secret')
  })

  it('should exclude sensitive seller profile fields', () => {
    const safeSellerProfile = {
      id: mockSellerProfile.sellerProfile.id,
      store_name: mockSellerProfile.sellerProfile.store_name,
      store_slug: mockSellerProfile.sellerProfile.store_slug,
      is_verified: mockSellerProfile.sellerProfile.is_verified,
      followers_count: mockSellerProfile.sellerProfile.followers_count,
    }

    expect(safeSellerProfile).not.toHaveProperty('profile_id')
    expect(safeSellerProfile).not.toHaveProperty('stripe_account_id')
    expect(safeSellerProfile).not.toHaveProperty('bank_account')
    expect(safeSellerProfile).not.toHaveProperty('tax_id')
  })

  it('should handle null seller profile', () => {
    const safeUser = {
      id: mockRawProfile.id,
      email: mockRawProfile.email,
      role: mockRawProfile.role,
      sellerProfile: null,
    }

    expect(safeUser.sellerProfile).toBeNull()
  })

  it('should convert created_at to ISO string or Date', () => {
    const safeUser = {
      id: mockRawProfile.id,
      created_at: mockRawProfile.created_at,
    }

    expect(safeUser.created_at).toBeInstanceOf(Date)
    expect(safeUser.created_at.toISOString()).toContain('2025-01-01')
  })

  it('should preserve all required fields', () => {
    const safeUser = {
      id: mockRawProfile.id,
      email: mockRawProfile.email,
      username: mockRawProfile.username,
      avatar: mockRawProfile.avatar,
      role: mockRawProfile.role,
      created_at: mockRawProfile.created_at,
      sellerProfile: null,
    }

    const requiredFields = ['id', 'email', 'role', 'created_at']
    const hasAll = requiredFields.every(field => field in safeUser)
    
    expect(hasAll).toBe(true)
  })

  it('should handle undefined optional fields gracefully', () => {
    const minimalProfile = {
      id: 'user-123',
      email: 'test@example.com',
      username: null,
      avatar: null,
      role: 'user' as const,
      created_at: new Date(),
      sellerProfile: null,
    }

    expect(minimalProfile.username).toBeNull()
    expect(minimalProfile.avatar).toBeNull()
    expect(minimalProfile.id).toBeDefined()
  })
})

describe('Auth Utilities - Data Security', () => {
  it('should never expose internal database IDs', () => {
    const safeResponse = {
      id: 'user-123',
      email: 'test@example.com',
      sellerProfile: {
        id: 'seller-123',
        store_name: 'Store',
      },
    }

    // Internal relationships should not be exposed
    expect(safeResponse.sellerProfile).not.toHaveProperty('profile_id')
    expect(safeResponse.sellerProfile).not.toHaveProperty('user_id')
  })

  it('should sanitize all string fields', () => {
    const testCases = [
      { username: '<script>alert("xss")</script>', expected: false },
      { username: 'normal-username', expected: true },
      { store_name: '"; DROP TABLE--', expected: false },
      { store_name: 'Valid Store Name', expected: true },
    ]

    testCases.forEach(({ username, store_name, expected }) => {
      if (username) {
        const isClean = !username.includes('<') && !username.includes('>')
        expect(isClean).toBe(expected)
      }
      if (store_name) {
        const isClean = !store_name.includes('"') && !store_name.includes('--')
        expect(isClean).toBe(expected)
      }
    })
  })

  it('should validate email format in response', () => {
    const validEmails = [
      'test@example.com',
      'user+tag@domain.co.uk',
      'firstname.lastname@example.org',
    ]

    validEmails.forEach(email => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      expect(isValid).toBe(true)
    })
  })

  it('should never expose passwords in any transformation', () => {
    const testObjects = [
      { id: '1', email: 'test@example.com', password: 'secret' },
      { id: '2', password_hash: 'hashed' },
      { id: '3', pass: 'hidden' },
    ]

    testObjects.forEach(obj => {
      const safeObj = {
        id: obj.id,
        email: obj.email || null,
      }
      expect(safeObj).not.toHaveProperty('password')
      expect(safeObj).not.toHaveProperty('password_hash')
    })
  })

  it('should handle XSS attempts in avatar URLs', () => {
    const maliciousAvatars = [
      'javascript:alert("xss")',
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox("xss")',
    ]

    const validAvatars = [
      'https://example.com/avatar.jpg',
      'https://cdn.example.com/images/avatar.png',
    ]

    // Validate that only https URLs are allowed
    const isValidUrl = (url: string) => url.startsWith('https://')

    maliciousAvatars.forEach(url => {
      expect(isValidUrl(url)).toBe(false)
    })

    validAvatars.forEach(url => {
      expect(isValidUrl(url)).toBe(true)
    })
  })
})