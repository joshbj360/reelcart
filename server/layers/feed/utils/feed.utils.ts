import type { IPost, IProduct } from "~~/layers/post/app/types/post.types"
import type { IFeedItem } from "../../../../layers/feed/app/types/feed.types"


/**
 * Normalize a post into feed item format
 */
export const normalizePost = (post: IPost): IFeedItem => {
  const primaryMedia = post.media?.[0]
  return {
    id: `post-${post.id}`,
    type: 'POST',
    created_at: post.created_at,
    author: {
      id: post.authorId,
      username: post.author?.username || 'Unknown',
      avatar: post.author?.avatar,
      role: 'user'
    },
   media: primaryMedia ? {
      id: primaryMedia.id,
      url: primaryMedia.url,
      type: primaryMedia.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    } : undefined,
    caption: post.caption || '',
    content: post.content || null, 
    contentType: post.contentType || 'COMMERCE',
    likeCount: post._count?.likes || 0,
    commentCount: post._count?.comments || 0,
    shareCount: post._count?.shares || 0,
    taggedProducts: [], // TODO: Add when post-product tagging is implemented
    _raw: post
  }
}

/**
 * Normalize a product into feed item format
 */
export const normalizeProduct = (product: IProduct): IFeedItem => {
  const primaryMedia = product.media?.[0]
  
  return {
    id: `product-${product.id}`,
    type: 'PRODUCT',
    created_at: product.created_at,
    author: {
      id: product.sellerId,
      username: product.seller?.store_name || product.seller?.store_slug || 'Unknown',
      avatar: product.seller?.store_logo || null || undefined,
      role: 'seller'
    },
    media: primaryMedia ? {
      id: primaryMedia.id,
      url: primaryMedia.url,
      type: primaryMedia.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    } : undefined,
    caption: product.title,
    contentType: 'PRODUCT',
    likeCount: product._count?.likes || 0,
    commentCount: product._count?.comments || 0,
    shareCount: 0,
    taggedProducts: [],
    product: product,
    _raw: product
  }
}

/**
 * Sort feed items by creation date (newest first)
 */
export const sortFeedItems = (items: IFeedItem[]): IFeedItem[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA
  })
}

/**
 * Merge and deduplicate feed items
 */
export const mergeFeedItems = (existing: IFeedItem[], incoming: IFeedItem[]): IFeedItem[] => {
  const itemMap = new Map<string, IFeedItem>()
  
  // Add existing items
  existing.forEach(item => itemMap.set(item.id, item))
  
  // Add/overwrite with incoming items
  incoming.forEach(item => itemMap.set(item.id, item))
  
  // Convert back to array and sort
  return sortFeedItems(Array.from(itemMap.values()))
}