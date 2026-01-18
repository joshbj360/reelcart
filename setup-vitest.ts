import { vi } from 'vitest'
import { defineNuxtConfig } from 'nuxt/config'  // Mock Nuxt if needed

// Global mocks (e.g., for Supabase)
vi.mock('#imports', () => ({
  useSupabaseClient: vi.fn().mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      // Add more mocks as needed
    }
  })
}))