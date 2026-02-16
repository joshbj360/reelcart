// FILE PATH: server/layers/user/repositories/content.repository.ts

import { get } from "node:http"

export const postRepository = {

  async getUserByUsername(username: string) {
    return await prisma.profile.findFirst({ where: { username } })
  },

  // ========== POSTS ==========
  async createPost(userId: string, data: any) {
  const postData: any = {
    id: crypto.randomUUID(),
    authorId: userId,
    caption: data.caption,
    content: data.content,
    contentType: data.contentType || 'COMMERCE'
  }
  
  // Only add mediaId if provided
  if (data.mediaId) {
    postData.mediaId = data.mediaId
  }
  
  return await prisma.post.create({
    data: postData,
    include: { 
      author: true,
      media: true,
      taggedProducts: true
    }
  })
},

  async getPostById(postId: string) {
    return await prisma.post.findUnique({
      where: { id: postId },
      include: { author: true, likes: true, comments: true }
    })
  },

  async getPostsByUserId(userId: string, limit: number, offset: number) {
    return await prisma.post.findMany({
      where: { authorId: userId },
      include: { author: true, likes: true, comments: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    })
  },

  async getPostCountByUserId(userId: string) {
    return await prisma.post.count({ where: { authorId: userId } })
  },

  async updatePost(postId: string, data: any) {
    return await prisma.post.update({
      where: { id: postId },
      data,
      include: { author: true }
    })
  },

      async getPosts(options: {
        take?: number
        skip?: number
        where?: any
        orderBy?: any
        include?: any
    }) {
        return await prisma.post.findMany({
            take: options.take,
            skip: options.skip,
            where: options.where,
            orderBy: options.orderBy,
            include: {
                author: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        shares: true
                    }
                },
                ...options.include
            }
        })
    },

  async getPostsByAuthorIds(authorIds: string[], options: any) {
        return await prisma.post.findMany({
            where: {
                authorId: { in: authorIds }
            },
            take: options.limit,
            skip: options.offset,
            orderBy: { created_at: 'desc' },
            include: {
                author: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        shares: true
                    }
                }
            }
        })
    },

  async deletePost(postId: string) {
    return await prisma.post.delete({ where: { id: postId } })
  },

  async count() {
    return await prisma.post.count()
  },

  // ========== COMMENTS ==========
  async createComment(userId: string, postId: string, data: any) {
    return await prisma.comment.create({
      data: { id: crypto.randomUUID(), authorId: userId, postId, ...data },
      include: { author: true }
    })
  },

  async getCommentById(commentId: string) {
    return await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: true }
    })
  },

  async getCommentsByPostId(postId: string, limit: number, offset: number) {
    return await prisma.comment.findMany({
      where: { postId, parentId: null },
      include: { author: true, replies: { include: { author: true } } },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    })
  },

  async getCommentCountByPostId(postId: string) {
    return await prisma.comment.count({ where: { postId } })
  },

  async updateComment(commentId: string, data: any) {
    return await prisma.comment.update({
      where: { id: commentId },
      data,
      include: { author: true }
    })
  },

  async deleteComment(commentId: string) {
    return await prisma.comment.delete({ where: { id: commentId } })
  },

  async getCommentReplies(commentId: string, limit: number, offset: number) {
  return await prisma.comment.findMany({
    where: { parentId: commentId },  // ← Filters by parent comment
    include: { author: true },
    take: limit,
    skip: offset,
    orderBy: { created_at: 'desc' }
  })
},

async getCommentRepliesCount(commentId: string) {
  return await prisma.comment.count({ where: { parentId: commentId } })
},

  // ========== POST LIKES ==========
  async createPostLike(userId: string, postId: string) {
    return await prisma.postLike.create({ data: { userId, postId } })
  },

  async getPostLike(userId: string, postId: string) {
    return await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } }
    })
  },

  async deletePostLike(userId: string, postId: string) {
    return await prisma.postLike.deleteMany({ where: { userId, postId } })
  },

  async getPostLikes(postId: string, limit: number, offset: number) {
    return await prisma.postLike.findMany({
      where: { postId },
      include: { user: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    })
  },

  async getPostLikesCount(postId: string) {
    return await prisma.postLike.count({ where: { postId } })
  },

  async getLikedPostsByUser(userId: string, limit: number, offset: number) {
    return await prisma.postLike.findMany({
      where: { userId },
      include: { post: { include: { author: true } } },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    })
  },

  async getLikedPostsCountByUser(userId: string) {
    return await prisma.postLike.count({ where: { userId } })
  },

  // ========== COMMENT LIKES ==========
  async createCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.create({ data: { userId, commentId } })
  },

  async getCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } }
    })
  },

  async deleteCommentLike(userId: string, commentId: string) {
    return await prisma.commentLike.deleteMany({ where: { userId, commentId } })
  },

  // ========== SHARES ==========
  async createShare(userId: string, targetId: string, type: 'POST' | 'PRODUCT', platform?: string) {
    return await prisma.share.create({
      data: {
        userId,
        postId: type === 'POST' ? targetId : null,
        productId: type === 'PRODUCT' ? parseInt(targetId) : null,
        platform: platform || 'internal'
      }
    })
  },

  async getPostShares(id: any, limit: number, offset: number) {
    return await prisma.share.findMany({
      where: { id },
      include: { profile: true },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    })
  },

  async getPostSharesCount(id: any) {
    return await prisma.share.count({ where: { id } })
  },

  async getSharesByUserId(userId: string, limit: number, offset: number) {
    return await prisma.share.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { created_at: 'desc' }
    })
  },

  async getSharesCountByUserId(userId: string) {
    return await prisma.share.count({ where: { userId } })
  },

  async savePost(userId: string, postId: string) {
    return await prisma.savedPost.upsert({
      where: {
        userId_postId: { userId, postId }
      },
      update: {}, // If already saved, do nothing
      create: { userId, postId }
    })
  },

  async unsavePost(userId: string, postId: string) {
    return await prisma.savedPost.delete({
      where: {
        userId_postId: { userId, postId }
      }
    })
  },

  async getSavedPost(postId: string) {
    return await prisma.savedPost.findFirst({
      where: { postId },
      include: {
        post: {
          include: {
            media: true,
            author: { select: { username: true, avatar: true } },
            _count: { select: { likes: true, comments: true } }
          }
        }
      },
    })
  },
  async getSavedPosts(userId: string, limit: number, offset: number) {
    return await prisma.savedPost.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            media: true,
            author: { select: { username: true, avatar: true } },
            _count: { select: { likes: true, comments: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })
  }
}