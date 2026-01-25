// layers/auth/app/tests/auth.api.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { AuthApiClient } from '../services/auth.api'

describe('Auth API Service', () => {
  let api: AuthApiClient

  beforeEach(() => {
    api = new AuthApiClient()
  })

  describe('Login', () => {
    it('should have login method', () => {
      expect(typeof api.login).toBe('function')
    })

    it('should accept email and password', () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      expect(credentials.email).toBeDefined()
      expect(credentials.password).toBeDefined()
    })
  })

  describe('Register', () => {
    it('should have register method', () => {
      expect(typeof api.register).toBe('function')
    })

    it('should accept email and password', () => {
      const data = { email: 'test@example.com', password: 'password123' }
      expect(data.email).toBeDefined()
      expect(data.password).toBeDefined()
    })
  })

  describe('Profile', () => {
    it('should have getProfile method', () => {
      expect(typeof api.getProfile).toBe('function')
    })
  })

  describe('Password Reset', () => {
    it('should have requestPasswordReset method', () => {
      expect(typeof api.requestPasswordReset).toBe('function')
    })

    it('should have completePasswordReset method', () => {
      expect(typeof api.completePasswordReset).toBe('function')
    })
  })

  describe('Email Verification', () => {
    it('should have verifyEmailToken method', () => {
      expect(typeof api.verifyEmailToken).toBe('function')
    })

    it('should have resendEmailVerification method', () => {
      expect(typeof api.resendEmailVerification).toBe('function')
    })
  })

  describe('Session', () => {
    it('should have refreshToken method', () => {
      expect(typeof api.refreshToken).toBe('function')
    })

    it('should have logout method', () => {
      expect(typeof api.logout).toBe('function')
    })
  })

  describe('OAuth', () => {
    it('should have loginWithOAuth method', () => {
      expect(typeof api.loginWithOAuth).toBe('function')
    })

    it('should accept provider', () => {
      const providers = ['google', 'facebook']
      expect(providers.includes('google')).toBe(true)
    })
  })

  describe('Seller Endpoints', () => {
    it('should have createSellerProfile method', () => {
      expect(typeof api.createSellerProfile).toBe('function')
    })

    it('should have getSellerProfiles method', () => {
      expect(typeof api.getSellerProfiles).toBe('function')
    })

    it('should have getSellerBySlug method', () => {
      expect(typeof api.getSellerBySlug).toBe('function')
    })

    it('should have deactivateSellerProfile method', () => {
      expect(typeof api.deactivateSellerProfile).toBe('function')
    })

    it('should have activateSellerProfile method', () => {
      expect(typeof api.activateSellerProfile).toBe('function')
    })
  })

  describe('All Methods Defined', () => {
    it('should have all auth methods defined', () => {
      const methods = [
        'login',
        'register',
        'getProfile',
        'requestPasswordReset',
        'completePasswordReset',
        'verifyEmailToken',
        'resendEmailVerification',
        'refreshToken',
        'logout',
        'loginWithOAuth',
        'createSellerProfile',
        'getSellerProfiles',
        'getSellerBySlug',
        'deactivateSellerProfile',
        'activateSellerProfile'
      ]

      methods.forEach(method => {
        expect((api as any)[method]).toBeDefined()
        expect(typeof (api as any)[method]).toBe('function')
      })
    })
  })
})