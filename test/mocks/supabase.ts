import { vi } from 'vitest'

export const serverSupabaseUser = vi.fn()
export const serverSupabaseClient = vi.fn(() => ({
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }))
}))