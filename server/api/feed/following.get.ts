import { requireAuth } from "../../layers/shared/middleware/requireAuth"
import { normalizePost } from "~~/server/layers/feed/utils/feed.utils"
import type { IFeedResponse } from "~~/layers/feed/app/types/feed.types"

export default defineEventHandler(async (event): Promise<IFeedResponse> => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0

  try {
    // Get IDs of users/sellers this user follows
    const follows = await prisma.follow.findMany({
      where: { followerId: user.id },
      select: { followingId: true }
    })

    if (follows.length === 0) {
      return {
        items: [],
        meta: { total: 0, limit, offset, hasMore: false }
      }
    }

    const followingIds = follows.map(f => f.followingId)

    // Fetch posts from followed users
    const posts = await prisma.post.findMany({
      where: { authorId: { in: followingIds } },
      take: limit,
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

    const items = posts.map(normalizePost)
    const total = await prisma.post.count({
      where: { authorId: { in: followingIds } }
    })

    return {
      items,
      meta: { total, limit, offset, hasMore: items.length === limit }
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch following feed'
    })
  }
})
