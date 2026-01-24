import { serverSupabaseUser } from '#supabase/server';
import { authRepository } from '../../database/repositories/auth.repository';
import { safeUserSchema, type ISafeUser } from '../../utils/auth/auth.schema';
import type { H3Event } from 'h3';

/**
 * Transforms a raw Database Profile (with joined SellerProfile) into a Safe User DTO.
 */
export function transformToSafeUser(profile: any): ISafeUser {
  return safeUserSchema.parse({
    id: profile.id,
    email: profile.email,
    username: profile.username,
    avatar: profile.avatar,
    role: profile.role,
    created_at: profile.created_at,
    sellerProfile: profile.sellerProfile ? {
      id: profile.sellerProfile.id,
      store_name: profile.sellerProfile.store_name,
      store_slug: profile.sellerProfile.store_slug,
      is_verified: profile.sellerProfile.is_verified,
      followers_count: profile.sellerProfile.followers_count,
    } : null
  });
}

/**
 * Enhanced auth helper that returns ONLY safe, validated data.
 */
export async function getAuthUser(event: H3Event): Promise<ISafeUser | null> {
  const user = await serverSupabaseUser(event);
  if (!user || !user.id) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: No active session',
    })
  }

  try {
    const profile = await authRepository.findById(user.id);
    if (!profile) return null;

    return transformToSafeUser(profile);
  } catch (error) {
    console.error('Safe Auth Error:', error);
    return null;
  }
}

export async function requireAuth(event: H3Event): Promise<ISafeUser> {
  const user = await getAuthUser(event);
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }
  return user;
}