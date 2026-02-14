import { BaseApiClient } from '../../../base/app/services/base.api'
import type { IPost, ICreatePostData, IPaginatedResponse } from '../types/post.types'

export class PostApiClient extends BaseApiClient {
  async createPost(data: ICreatePostData): Promise<IPost> {
    return this.request('/api/posts', { method: 'POST', body: data })
  }
  
  async getUserFeed(limit: number = 20, offset: number = 0): Promise<IPaginatedResponse<IPost>> {
    return this.request(`/api/posts?limit=${limit}&offset=${offset}`, { method: 'GET' })
  }
  
  async getUserPost(username: string, id:string): Promise<IPaginatedResponse<IPost>> {
    return this.request(`/api/profile/${username}/posts/${id}`, { method: 'GET' })
  }
  async getUserPosts(username: string, limit: number = 9, offset: number = 0): Promise<IPaginatedResponse<IPost>> {
    return this.request(`/api/profile/${username}/posts?limit=${limit}&offset=${offset}`, { method: 'GET' })
  }

  async getPostById(id: string): Promise<IPost> {
    return this.request(`/api/posts/${id}`, { method: 'GET' })
  }
  
  async likePost(id: string): Promise<any> {
    return this.request(`/api/posts/${id}/like`, { method: 'POST' })
  }
  
  async unlikePost(id: string): Promise<any> {
    return this.request(`/api/posts/${id}/like`, { method: 'DELETE' })
  }

  async getSavedPost(postId: string): Promise<IPaginatedResponse<IPost>> {
    return this.request(`/api/posts/save/${postId}`, { method: 'GET' })
  }
  async getSavedPosts(limit: number = 20, offset: number = 0): Promise<IPaginatedResponse<IPost>> {
    return this.request(`/api/posts/save?limit=${limit}&offset=${offset}`, { method: 'GET' })
  }

  async savePost(id: string): Promise<any> {
    return this.request(`/api/posts/save`, { method: 'POST' })
  }
  
  async unsavePost(id: string): Promise<any> {  
    return this.request(`/api/posts/save/${id}`, { method: 'DELETE' })
  }
}

let instance: PostApiClient | null = null
export const usePostApi = () => {
  if (!instance) instance = new PostApiClient()
  return instance
}