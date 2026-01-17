import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthApiClient } from '../services/auth.api'

// Mock dependencies
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ public: { baseURL: 'http://localhost:3000' } }),
  useRequestEvent: () => undefined
}))

vi.mock('../../base/services/api/base.api', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    // We don't need to mock BaseApiClient if we mock $fetch and imports,
    // but to be safe we can let it be real or mock it if needed.
    // Using real BaseApiClient is better to test inheritance.
  }
})

describe('AuthApiClient', () => {
  let client: AuthApiClient

  beforeEach(() => {
    vi.clearAllMocks()
    client = new AuthApiClient()
  })

  it('should call login endpoint', async () => {
    mockFetch.mockResolvedValue({ user: { id: '1' } })
    await client.login({ email: 'test@test.com', password: 'password' })

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', expect.objectContaining({
      method: 'POST',
      body: { email: 'test@test.com', password: 'password' }
    }))
  })

  it('should call register endpoint', async () => {
    mockFetch.mockResolvedValue({ success: true })
    await client.register({ email: 'test@test.com', password: 'password' })

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/register', expect.objectContaining({
      method: 'POST',
      body: { email: 'test@test.com', password: 'password' }
    }))
  })

  it('should call getProfile endpoint', async () => {
    mockFetch.mockResolvedValue({ user: { id: '1' } })
    await client.getProfile()

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/profile', expect.anything())
  })

  it('should call createSellerProfile endpoint', async () => {
    mockFetch.mockResolvedValue({ user: { id: '1' } })
    await client.createSellerProfile({ store_name: 'Test Store' })

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/seller/profile', expect.objectContaining({
      method: 'POST',
      body: { store_name: 'Test Store' }
    }))
  })

  it('should call getSellerBySlug endpoint', async () => {
    mockFetch.mockResolvedValue({ seller: { id: 's1' } })
    await client.getSellerBySlug('my-store')

    expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/seller/my-store', expect.anything())
  })
})
