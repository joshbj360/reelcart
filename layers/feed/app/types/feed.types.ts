import type { IPost, IProduct } from "../../../../layers/post/app/types/post.types"


/**
 * Unified feed item interface
 * Normalizes posts and products into a single consumable format
 */
export interface IFeedItem {
  id: string                    // Unique identifier: "post-{id}" or "product-{id}"
  type: 'POST' | 'PRODUCT'      // Discriminator for rendering
  created_at: Date            // ISO timestamp for sorting
  
  // Normalized author (works for both users and sellers)
  author: {
    id: string
    username: string
    avatar?: string | null | undefined
    role: 'user' | 'seller'
  }
  
  // Media (primary display)
  media?: {
    id: string
    url: string
    type: 'IMAGE' | 'VIDEO' | 'AUDIO'
    thumbnailUrl?: string
  }
  
  // Content
  caption: string
  content?: string | null   // For posts: text content; For products: description
  contentType: string         // For posts: EXPERIENCE, INSPIRATION, etc.
  
  // Engagement metrics
  likeCount: number
  commentCount: number
  shareCount?: number
  
  // Product references
  taggedProducts?: Partial<IProduct>[]  // Products tagged in post
  product?: IProduct                     // For PRODUCT type, the actual product
  
  // Original data (for type-specific operations)
  _raw: IPost | IProduct        // Preserve original object
}

/**
 * Paginated feed response
 */
export interface IFeedResponse {
  items: IFeedItem[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

/**
 * Feed fetch options
 */
export interface IFeedOptions {
  limit?: number
  offset?: number
  type?: 'all' | 'posts' | 'products'
  userId?: string               // Filter by specific user/seller
}