// layers/base/services/api/base.api.ts

/**
 * Base API Client with Auth Store Integration
 */

import { type H3Event, getHeader } from 'h3'
import { useRequestEvent, useRuntimeConfig } from 'nuxt/app'
import { ApiError } from './api.error'
import { useAuthStore } from '../stores/auth.store'

export interface ApiServiceOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, any> | BodyInit | null
  params?: Record<string, any>
  headers?: Record<string, string>
  skipAuth?: boolean
  skipCsrf?: boolean
}

export class BaseApiClient {
  protected baseURL: string

  constructor() {
    this.baseURL = this.initializeBaseURL()
  }

  private initializeBaseURL(): string {
    if (import.meta.server) {
      try {
        const config = useRuntimeConfig()
        return config.public.baseURL as string || ''
      } catch {
        console.warn('Could not get baseURL from runtime config')
        return ''
      }
    } else {
      return typeof window !== 'undefined' && window.location.origin ? window.location.origin : ''
    }
  }

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
      const token = this.getAuthToken()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    // Add CSRF token (client-side)
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
   * Get auth token from auth store OR localStorage
   */
  private getAuthToken(): string | null {
    if (import.meta.server) {
      return null
    }

    try {
      // Try to get from auth store first (if available)
      try {
        const authStore = useAuthStore()
        if (authStore?.accessToken) {
          return authStore.accessToken
        }
      } catch (e) {
        // Store might not be available yet, fall back to localStorage
      }

      // Fallback to localStorage
      const token = localStorage.getItem('accessToken')
      return token
    } catch (error) {
      console.debug('Failed to get auth token:', error)
      return null
    }
  }

  private getCsrfToken(): string | null {
    if (import.meta.server) {
      return null
    }

    const metaTag = document.querySelector('meta[name="csrf-token"]')
    if (metaTag) {
      return metaTag.getAttribute('content')
    }

    const name = '__csrf_token='
    const decodedCookie = decodeURIComponent(document.cookie)
    const cookies = decodedCookie.split(';')

    for (const cookie of cookies) {
      const trimmed = cookie.trim()
      if (trimmed.startsWith(name)) {
        return trimmed.substring(name.length)
      }
    }

    try {
      const token = sessionStorage.getItem('__csrf_token')
      if (token) return token
    } catch (e) {
      // sessionStorage might not be available
    }

    return null
  }

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

    const safeMessage = this.getSafeErrorMessage(statusCode, message)

    throw new ApiError(safeMessage, statusCode, data)
  }

  private getSafeErrorMessage(statusCode: number, originalMessage: string): string {
    const errorMap: Record<number, string> = {
      0: 'Network error. Please check your connection.',
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please log in again.',
      403: 'You do not have permission to access this.',
      404: 'Resource not found.',
      409: 'Conflict. This resource already exists.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.',
      500: 'Server error. Please try again later.',
      503: 'Service unavailable. Please try again later.',
    }

    return errorMap[statusCode] || originalMessage
  }

  protected cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        cleaned[key] = value
      }
    }
    return cleaned
  }
}