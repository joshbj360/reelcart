import  {type H3Event, getHeader } from 'h3'
import { useRequestEvent, useRuntimeConfig } from '#imports'

export interface ApiServiceOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Record<string, any> | BodyInit | null
  params?: Record<string, any>
  headers?: Record<string, string>
}

export class BaseApiClient {
  protected baseURL: string

  constructor() {
    // ✅ This is fine - runs INSIDE component/composable context
    const config = useRuntimeConfig()
    this.baseURL = config.public.baseURL || ''
  }

  protected async request<T>(
    endpoint: string,
    options: ApiServiceOptions = {}
  ): Promise<T> {
    const headers: Record<string, string> = { ...options.headers }

    if (
      options.body &&
      typeof options.body === 'object' &&
      !(options.body instanceof FormData)
    ) {
      if (['POST', 'PATCH', 'PUT'].includes(options.method?.toUpperCase() || 'POST')) {
        headers['Content-Type'] = 'application/json'
      }
    }

    // Auth forwarding for SSR
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
      return await $fetch<T>(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      })
    } catch (error: any) {
      const statusCode = error.statusCode || 500
      const message = error.data?.message || 'An unexpected error occurred.'

      console.error(`API Error on ${endpoint}:`, error)
      throw new ApiError(message, statusCode, error.data)
    }
  }

  protected cleanParams(params: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        cleaned[key] = value
      }
    }
    return cleaned
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}