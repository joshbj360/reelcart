import { z } from 'zod';
import { enhancedPasswordSchema } from './passwordValidator'

// --- INPUT SCHEMAS (Client -> Server) ---
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: enhancedPasswordSchema,
  username: z.string().min(3).max(50).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password required'),
})

// --- OUTPUT SCHEMAS (Server -> Client) ---
// This defines exactly what fields the browser is allowed to see
export const safeSellerProfileSchema = z.object({
  id: z.string(),
  store_name: z.string().nullable(),
  store_slug: z.string(),
  is_verified: z.boolean(),
  followers_count: z.number().default(0),
});

export const safeUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().nullable(),
  avatar: z.string().nullable(),
  role: z.enum(['user', 'seller']),
  created_at: z.date().or(z.string()),
  sellerProfile: safeSellerProfileSchema.nullable(),
});

// --- INFERRED TYPES ---
export type ILoginCredentials = z.infer<typeof loginSchema>;
export type IRegisterData = z.infer<typeof registerSchema>;
export type ISafeUser = z.infer<typeof safeUserSchema>;
export type ISafeSellerProfile = z.infer<typeof safeSellerProfileSchema>;