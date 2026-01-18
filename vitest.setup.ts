// vitest.setup.ts
import { vi } from 'vitest'



// Global mocks for Supabase (prevents real API calls in tests)
vi.mock('#supabase/client', () => ({
  useSupabaseClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn()
    }
  })),
  useSupabaseUser: vi.fn(() => ref(null))
}))

vi.mock('#supabase/server', () => ({
  serverSupabaseClient: vi.fn(),
  serverSupabaseUser: vi.fn()
}))

// Optional: mock notifications so they don't spam console
vi.mock('@kyvg/vue3-notification', () => ({
  notify: vi.fn()
}))

// Optional: mock navigateTo
vi.mock('nuxt/app', () => ({
  navigateTo: vi.fn()
}))

vi.mock('nuxt/app', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRuntimeConfig: vi.fn(() => ({
      public: {
        baseURL: 'http://localhost:3000'  // ← CHANGE THIS to match your real runtime config
        // If your API is prefixed differently, use: '/api' or '/api'
      }
    })),
    navigateTo: vi.fn()
  }
})