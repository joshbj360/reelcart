// tests/setup.ts
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// 1. Mock navigateTo (Nuxt's router push replacement)
vi.stubGlobal('navigateTo', vi.fn())

// 2. Mock useRoute if needed
vi.stubGlobal('useRoute', () => ({
  query: {},
  params: {}
}))

// 3. Silence the Color Mode plugin error
// This mocks the internal Nuxt state used by the plugin
vi.mock('#imports', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    useState: (key: string, init: any) => {
      // Return a fake reactive ref for color-mode preference
      if (key === 'color-mode-preference') {
        return { value: 'system' }
      }
      return actual.useState(key, init)
    }
  }
})