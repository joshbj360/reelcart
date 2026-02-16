import { IFeedResponse } from "~~/layers/feed/app/types/feed.types"
import { normalizePost, normalizeProduct } from "~~/server/layers/feed/utils/feed.utils"



export default defineEventHandler(async (event): Promise<IFeedResponse> => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0
  const type = query.type as 'all' | 'posts' | 'products' || 'all'
  
  // TODO: Get user from session
  const userId = event.context.user?.id
  
  try {
    const items: any[] = []
    
    // Fetch posts (if needed)
    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        take: Math.ceil(limit / 2),
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          author: true,
          media: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              shares: true
            }
          }
        }
      })
      
      items.push(...posts.map(normalizePost))
    }
    
    // Fetch products (if needed)
    if (type === 'all' || type === 'products') {
      const products = await prisma.products.findMany({
        take: Math.ceil(limit / 2),
        skip: offset,
        orderBy: { created_at: 'desc' },
        include: {
          seller: true,
          media: true,
          _count: {
            select: {
              likes: true,
              comments: true,
              shares: true
            }
          }
        }
      })
      
      items.push(...products.map(normalizeProduct))
    }
    
    // Sort by date
    const sortedItems = items.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    
    // Slice to exact limit
    const finalItems = sortedItems.slice(0, limit)
    
    return {
      items: finalItems,
      meta: {
        total: await getTotalCount(type),
        limit,
        offset,
        hasMore: sortedItems.length === limit
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch feed'
    })
  }
})

async function getTotalCount(type: 'all' | 'posts' | 'products'): Promise<number> {
  if (type === 'posts') {
    return await prisma.post.count()
  }
  if (type === 'products') {
    return await prisma.products.count()
  }
  // For 'all', return combined count
  const [postsCount, productsCount] = await Promise.all([
    prisma.post.count(),
    prisma.products.count()
  ])
  return postsCount + productsCount
}