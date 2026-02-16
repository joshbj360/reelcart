// FILE PATH: server/layers/user/schemas/content.schema.ts

/**
 * Content Schema
 * Validation for posts, comments, likes, shares
 */

import { z } from 'zod'

// ==================== POSTS ====================

export const createPostSchema = z.object({
  caption: z.string().max(2000).optional(),
  content: z.string().max(10000).optional(),
  mediaId: z.string().uuid().optional(),  // ← Now optional
  contentType: z.enum([
    'COMMERCE',
    'EXPERIENCE',
    'INSPIRATION',
    'EDUCATIONAL',
    'ENTERTAINMENT'
  ]).default('COMMERCE')
}).refine(
  (data) => {
    // Rules:
    // 1. COMMERCE, EXPERIENCE, INSPIRATION require media
    // 2. At least one of caption, content, or media required
    
    const needsMedia = ['COMMERCE', 'EXPERIENCE', 'INSPIRATION'].includes(data.contentType)
    const hasMediaOrContent = !!data.mediaId || !!data.content || !!data.caption
    
    if (needsMedia && !data.mediaId) {
      return false
    }
    
    if (!hasMediaOrContent) {
      return false
    }
    
    return true
  },
  {
    message: 'Commerce/Experience/Inspiration posts require mediaId. All posts need at least caption, content, or media.'
  }
)

export const updatePostSchema = z.object({
  caption: z.string().max(2000).optional(),
  content: z.string().max(10000).optional(),
  contentType: z.enum([
    'COMMERCE',
    'EXPERIENCE',
    'INSPIRATION',
    'EDUCATIONAL',
    'ENTERTAINMENT'
  ]).optional()
})

// ==================== COMMENTS ====================

export const createCommentSchema = z.object({
  text: z.string().min(1).max(500),
  parentId: z.string().uuid().optional()
})

export const updateCommentSchema = z.object({
  text: z.string().min(1).max(500)
})

// ==================== SHARES ====================

export const createShareSchema = z.object({
  platform: z.string().optional(),
  shareUrl: z.string().url().optional()
})

// ==================== PAGINATION ====================

export const paginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
})