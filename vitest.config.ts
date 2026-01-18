// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    setupFiles: ['./vitest.setup.ts'],
    
    // 1. Fix Supabase Crash: Force env vars directly
    env: {
      VITEST: 'true',
      SUPABASE_URL: 'https://mock.supabase.co',
      SUPABASE_KEY: 'mock-key',
      NUXT_PUBLIC_SUPABASE_URL: 'https://mock.supabase.co',
      NUXT_PUBLIC_SUPABASE_KEY: 'mock-key'
    },
    
    environmentOptions: {
      nuxt: {
        overrides: {
          // 2. Redundant safety for runtime config
          runtimeConfig: {
            public: {
              supabase: {
                url: 'https://mock.supabase.co',
                key: 'mock-key'
              }
            }
          }
        }
      }
    }
  },

})