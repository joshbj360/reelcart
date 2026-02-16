import { normalizePost, normalizeProduct } from "~~/server/layers/feed/utils/feed.utils"
import type { IFeedResponse } from "~~/layers/feed/app/types/feed.types"

export default defineEventHandler(async (event): Promise<IFeedResponse> => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0

  try {
    // Fetch popular posts (ordered by like count)
    const posts = await prisma.post.findMany({
      take: Math.ceil(limit / 2),
      skip: offset,
      orderBy: { likes: { _count: 'desc' } },
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

    // Fetch popular products
    const products = await prisma.products.findMany({
      take: Math.ceil(limit / 2),
      skip: offset,
      where: { status: 'PUBLISHED' },
      orderBy: { soldCount: 'desc' },
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

    const items = [
      ...posts.map(normalizePost),
      ...products.map(normalizeProduct)
    ].sort((a, b) => {
      // Sort by engagement (likes + comments)
      const engA = a.likeCount + a.commentCount
      const engB = b.likeCount + b.commentCount
      return engB - engA
    }).slice(0, limit)

    const [postsCount, productsCount] = await Promise.all([
      prisma.post.count(),
      prisma.products.count({ where: { status: 'PUBLISHED' } })
    ])

    return {
      items,
      meta: {
        total: postsCount + productsCount,
        limit,
        offset,
        hasMore: items.length === limit
      }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch discover feed'
    })
  }
})
