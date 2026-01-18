export const mockUsers = {
  regularUser: {
    id: 'user-123',
    email: 'user@test.com',
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
    role: 'user',
    created_at: '2025-01-01T00:00:00.000Z',
    sellerProfile: null,
  },
  
  sellerUser: {
    id: 'seller-456',
    email: 'seller@test.com',
    username: 'testseller',
    avatar: 'https://example.com/seller-avatar.jpg',
    role: 'seller',
    created_at: '2025-01-01T00:00:00.000Z',
    sellerProfile: {
      id: 'seller-profile-789',
      store_name: 'Test Store',
      store_slug: 'test-store',
      store_description: 'A test store',
      is_verified: true,
      followers_count: 100,
    },
  },
  
  unverifiedSeller: {
    id: 'seller-999',
    email: 'unverified@test.com',
    username: 'unverified',
    role: 'seller',
    created_at: '2025-01-01T00:00:00.000Z',
    sellerProfile: {
      id: 'seller-profile-999',
      store_name: 'Unverified Store',
      store_slug: 'unverified-store',
      is_verified: false,
      followers_count: 0,
    },
  },
}

export const mockCredentials = {
  valid: {
    email: 'user@test.com',
    password: 'ValidPassword123!',
  },
  invalid: {
    email: 'wrong@test.com',
    password: 'wrong',
  },
  weak: {
    email: 'user@test.com',
    password: '123', // Too short
  },
}

export const mockSupabaseResponse = {
  success: {
    data: {
      user: {
        id: 'user-123',
        email: 'user@test.com',
        user_metadata: {
          username: 'testuser',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
      session: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      },
    },
    error: null,
  },
  
  error: {
    data: null,
    error: {
      message: 'Invalid login credentials',
      status: 401,
    },
  },
}