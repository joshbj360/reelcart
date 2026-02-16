import { BaseApiClient } from "~~/layers/base/app/services/base.api"
import type { IFeedOptions, IFeedResponse } from "../types/feed.types"


/**
 * Feed API Client
 * Handles fetching mixed feed of posts and products
 */
export class FeedApiClient extends BaseApiClient {
  /**
   * Fetch home feed (mixed posts and products)
   */
  async getHomeFeed(options: IFeedOptions = {}): Promise<IFeedResponse> {
    const { limit = 20, offset = 0, type = 'all' } = options
    
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    
    if (type !== 'all') {
      params.append('type', type)
    }
    
    return this.request(`/api/feed/home?${params}`, { 
      method: 'GET' 
    })
  }
  
  /**
   * Fetch following feed (posts from followed users/sellers)
   */
  async getFollowingFeed(options: IFeedOptions = {}): Promise<IFeedResponse> {
    const { limit = 20, offset = 0 } = options
    
    return this.request(`/api/feed/following?limit=${limit}&offset=${offset}`, {
      method: 'GET'
    })
  }
  
  /**
   * Fetch discover feed (algorithmic recommendations)
   */
  async getDiscoverFeed(options: IFeedOptions = {}): Promise<IFeedResponse> {
    const { limit = 20, offset = 0 } = options
    
    return this.request(`/api/feed/discover?limit=${limit}&offset=${offset}`, {
      method: 'GET'
    })
  }
  
  /**
   * Fetch user-specific feed (profile page)
   */
  async getUserFeed(userId: string, options: IFeedOptions = {}): Promise<IFeedResponse> {
    const { limit = 20, offset = 0 } = options
    
    return this.request(`/api/feed/user/${userId}?limit=${limit}&offset=${offset}`, {
      method: 'GET'
    })
  }
}

// Singleton instance
let feedApiInstance: FeedApiClient | null = null

export const useFeedApi = (): FeedApiClient => {
  if (!feedApiInstance) {
    feedApiInstance = new FeedApiClient()
  }
  return feedApiInstance
}