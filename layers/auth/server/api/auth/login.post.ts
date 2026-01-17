import { serverSupabaseClient } from '#supabase/server';
import { authRepository } from "../../../database/repositories/auth.repository";
import { loginSchema } from '../../../utils/auth.schema';
import { transformToSafeUser } from '../../utils/auth.utils';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  // 1. Validate Input
  const { email, password } = loginSchema.parse(body);

  const supabase = await serverSupabaseClient(event);
  
  // 2. Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw createError({ statusCode: 401, message: error.message });
  }

  // 3. Database Sync
  const profile = await authRepository.findOrCreateProfile({
    id: data.user.id,
    email: data.user.email!,
    username: data.user.user_metadata.user_name || email.split('@')[0],
    avatar: data.user.user_metadata.avatar_url,
  });

  // 4. Clean Response (DTO)
  return {
    user: transformToSafeUser(profile),
    session: {
      access_token: data.session.access_token,
      expires_at: data.session.expires_at,
    },
  };
});