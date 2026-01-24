// layers/base/services/api/base.api.ts (IMPROVED)
/**
 * Base API Client
 * 
 * Provides:
 * - Automatic Supabase token injection
 * - CSRF token support
 * - SSR cookie forwarding
 * - Robust error handling
 * - Session caching
 */

import { type H3Event, getHeader } from 'h3'
import { useRequestEvent, useRuntimeConfig } from 'nuxt/app'
import { ApiError } from './api.error'

export interface ApiServiceOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, any> | BodyInit | null
  params?: Record<string, any>
  headers?: Record<string, string>
  skipAuth?: boolean // Skip adding auth token (for public endpoints)
  skipCsrf?: boolean // Skip adding CSRF token (for non-state-changing requests)
}

export class BaseApiClient {
  protected baseURL: string
  private static sessionCache: { token?: string; timestamp: number } = { timestamp: 0 }
  private static readonly SESSION_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor() {
    this.baseURL = this.initializeBaseURL()
  }

  /**
   * Initialize base URL safely
   */
  private initializeBaseURL(): string {
    if (import.meta.server) {
      // Server-side
      try {
        const config = useRuntimeConfig()
        return config.public.baseURL as string || ''
      } catch {
        console.warn('Could not get baseURL from runtime config')
        return ''
      }
    } else {
      // Client-side
      return typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''
    }
  }

  /**
   * Main request method
   */
  protected async request<T>(
    endpoint: string,
    options: ApiServiceOptions = {}
  ): Promise<T> {
    const headers: Record<string, string> = { ...options.headers }

    // Set Content-Type for JSON requests
    if (
      options.body &&
      typeof options.body === 'object' &&
      !(options.body instanceof FormData)
    ) {
      if (['POST', 'PATCH', 'PUT'].includes(options.method?.toUpperCase() || 'POST')) {
        headers['Content-Type'] = 'application/json'
      }
    }

    // Add auth token (client-side)
    if (!options.skipAuth && import.meta.client) {
      try {
        const token = await this.getSupabaseToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      } catch (error) {
        // Log but don't fail - some endpoints don't require auth
        console.debug('Could not retrieve auth token:', error)
      }
    }

    // Add CSRF token (client-side, for state-changing requests)
    if (!options.skipCsrf && import.meta.client) {
      const csrfToken = this.getCsrfToken()
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
    }

    // Forward cookies (server-side SSR)
    if (import.meta.server) {
      const event: H3Event | undefined = useRequestEvent()
      if (event) {
        const cookie = getHeader(event, 'cookie')
        if (cookie) {
          headers['cookie'] = cookie
        }
      }
    }

    try {
      const url = `${this.baseURL}${endpoint}`

      return await $fetch<T>(url, {
        ...options,
        headers,
      }) as T
    } catch (error: any) {
      throw this.handleError(error, endpoint)
    }
  }

  /**
   * Get Supabase auth token with caching
   */
  private async getSupabaseToken(): Promise<string | null> {
    // Check cache first (avoid repeated auth checks)
    const now = Date.now()
    if (
      BaseApiClient.sessionCache.token &&
      now - BaseApiClient.sessionCache.timestamp < BaseApiClient.SESSION_CACHE_TTL
    ) {
      return BaseApiClient.sessionCache.token || null
    }

    try {
      const supabase = useSupabaseClient()
      if (!supabase) {
        console.debug('Supabase client not initialized')
        return null
      }

      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.debug('Supabase session error:', error)
        return null
      }

      if (session?.access_token) {
        // Cache the token
        BaseApiClient.sessionCache = {
          token: session.access_token,
          timestamp: now,
        }
        return session.access_token
      }

      return null
    } catch (error) {
      console.debug('Failed to get Supabase token:', error)
      return null
    }
  }

  /**
   * Get CSRF token from DOM or cookie
   */
  private getCsrfToken(): string | null {
    if (import.meta.server) {
      return null
    }

    // Try meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    if (metaTag) {
      return metaTag.getAttribute('content')
    }

    // Try cookie
    const name = '__csrf_token='
    const decodedCookie = decodeURIComponent(document.cookie)
    const cookies = decodedCookie.split(';')

    for (const cookie of cookies) {
      const trimmed = cookie.trim()
      if (trimmed.startsWith(name)) {
        return trimmed.substring(name.length)
      }
    }

    // Try header (from server response)
    try {
      const token = sessionStorage.getItem('__csrf_token')
      if (token) return token
    } catch (e) {
      // sessionStorage might not be available
    }

    return null
  }
  /**
   * Improved error handling
   */
  private handleError(error: any, endpoint: string): Error {
    // Network error
    if (!error.response && error.message) {
      console.error(`Network error on ${endpoint}:`, error.message)
      throw new ApiError(
        'Network error. Please check your connection.',
        0,
        { originalError: error }
      )
    }

    // HTTP error
    const statusCode = error.status || error.statusCode || 500
    const data = error.data || error.response?.data || {}
    const message = data.message || error.message || 'An unexpected error occurred.'

    console.error(`API Error [${statusCode}] on ${endpoint}:`, {
      message,
      data,
      error: error.message,
    })

    // Don't expose sensitive errors
    const safeMessage = this.getSafeErrorMessage(statusCode, message)

    throw new ApiError(safeMessage, statusCode, data)
  }

  /**
   * Get user-friendly error message
   */
  private getSafeErrorMessage(statusCode: number, originalMessage: string): string {
    const errorMap: Record<number, string> = {
      0: 'Network error. Please check your connection.',
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'You do not have permission to access this.',
      404: 'Resource not found.',
      409: 'Conflict. This resource already exists.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      503: 'Service unavailable. Please try again later.',
    }

    return errorMap[statusCode] || originalMessage
  }

  /**
   * Helper to clean params
   */
  protected cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value
      }
    }
    return cleaned
  }

  /**
   * Clear session cache (call on logout)
   */
  public static clearCache(): void {
    BaseApiClient.sessionCache = { timestamp: 0 }
  }
}
