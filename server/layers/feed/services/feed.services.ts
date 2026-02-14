// server/layers/feed/services/feed.service.ts

/**
 * Feed Service
 * Aggregates Posts and Products for Home and Personalized feeds
 */

import { postRepository } from '../../posts/repositories/post.repository'

import type { IFeedOptions } from '../../../../layers/feed/app/types/feed.types'
import { normalizePost, normalizeProduct } from '../utils/feed.utils'
import { socialRepository } from '../../profile/repositories/social.repository'

export const feedService = {
  /**
   * Get home feed (aggregates posts and products)
   */
  async getHomeFeed(options: IFeedOptions) {
    const { limit = 20, offset = 0 } = options
    
    // Fetch from multiple repositories in parallel
    // We fetch a bit more than limit/2 to ensure we have enough after merging/sorting
    const [posts, products] = await Promise.all([
      postRepository.getPosts({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      productRepository.getProducts({ // Corrected method name
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      })
    ])
    
    // Normalize and merge
    const feedItems = [
      ...posts.map(normalizePost),
      ...products.map(normalizeProduct)
    ]
    
    // Sort by date (Business Logic)
    const sorted = feedItems.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    
    const items = sorted.slice(0, limit)

    return {
      items,
      meta: {
        total: await this.getTotalCount(),
        limit,
        offset,
        hasMore: items.length === limit
      }
    }
  },
  
  /**
   * Get following feed (posts from followed users/sellers)
   */
  async getFollowingFeed(userId: string, options: IFeedOptions) {
    const { limit = 20, offset = 0 } = options

    // 1. Get followed entities (Users and Sellers)
    const follows = await socialRepository.getFollowingByUserId(userId, 1000, 0)
    
    if (!follows || follows.length === 0) {
      return { items: [], meta: { total: 0, limit, offset, hasMore: false } }
    }

    // 2. Extract strictly the IDs for the query
    const followingIds = follows.map(f => f.followingId)
    
    // 3. Fetch posts from those specific IDs
    // Note: We prioritize Posts for the following feed to keep it social
    const posts = await postRepository.getPostsByAuthorIds(
      followingIds,
      {take: limit,  skip: offset}
    )
    const items = posts.map(normalizePost)

    return {
      items,
      meta: {
        total: posts.length,
        limit,
        offset,
        hasMore: items.length === limit
      }
    }
  },
  
  /**
   * Utility to get combined total count
   */
  async getTotalCount() {
    try {
        const [postsCount, productsCount] = await Promise.all([
            postRepository.count(),
            productRepository.count()
        ])
        return postsCount + productsCount
    } catch (e) {
        return 0 // Fallback for meta stats
    }
  }
}