
import type { IPaginationMeta, IProfile } from '../../../../layers/profile/app/types/profile.types';
import type { ProductsModel, PostModel } from '../../../../prisma/generated/models'
export interface IPost extends PostModel {

    author?: IProfile
    media?: Array<{
        id: string
        url: string
        type: 'IMAGE' | 'VIDEO' | 'AUDIO'
        thumbnailUrl?: string
    }> | null
    _count?: { likes: number; comments: number; shares: number }
}

export interface ICreatePostData {
    caption: string
    content?: string
    contentType?: string
    mediaId?: string
}

export interface IPaginatedResponse<T> {
  data: T[]
  meta: IPaginationMeta
}


export interface IProduct extends ProductsModel {
    seller?: {
        store_slug: string
        store_logo?: string | null | undefined
        store_name?: string | null | undefined
    },

    _count?: {
        likes: number
        comments: number,
        shares: number
    },

    media?: Array<{
        id: string
        url: string
        type: 'IMAGE' | 'VIDEO' | 'AUDIO'
        thumbnailUrl?: string
    }>

    
}