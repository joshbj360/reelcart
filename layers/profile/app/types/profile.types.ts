
//Location:** `~/layers/profile/app/types/profile.types.ts`
import type { ProfileModel } from '../../../../prisma/generated/models'
export interface IProfile extends ProfileModel {
  stateOfResidence?: string
  fullAddress?: string,
  profileUrl?: string
   profileStats?: IProfileStats
}


export interface IProfileStats {
  followersCount: number | 0
  followingCount: number | 0
  postsCount: number | 0
  followingUsersCount?: number | 0
  followingSellersCount?: number | 0
  likesCount: number| 0
}




export interface IComment {
  id: string
  text: string
  authorId: string
  author?: IProfile
  postId: string
  createdAt: string
  _count?: { likes: number; replies: number }
}

export interface ICreateCommentData {
  text: string
  parentId?: string
}

export interface INotification {
  id: string
  userId: string
  type: string
  actorId: string
  message: string
  read: boolean
  createdAt: string
}

export interface IConversation {
  id: string
  userId: string
  otherUserId: string
  otherUser?: IProfile
  createdAt: string
}

export interface IMessage {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}

export interface IPaginationMeta {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface IPaginatedResponse<T> {
  data: T[]
  meta: IPaginationMeta
}

export interface IFollowResponse {
    items: {
        id: string;
        username: string;
        avatar: string | null;
        bio?: string | null;
        type: "USER" | "SELLER";
        followedAt: Date;
        role?: string | undefined;
        name?: string | null | undefined;
        isVerified?: boolean | undefined;
    }[];
    meta: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

export interface IFollowStatus {
    isFollowing: boolean;
    followedAt: Date | null;
}

export interface IFollowStat {
    followersCount: number;
    followingCount: number;
    followingUsersCount: number;
    followingSellersCount: number;
}