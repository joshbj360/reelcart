import type { Profile, SellerProfile } from '../../../prisma/generated/client';
import type { ISafeUser, ISafeSellerProfile, ILoginCredentials, IRegisterData } from '../utils/auth.schema';

// Database-level types (Internal)
export interface IProfile extends Profile {
    sellerProfile?: ISellerProfile;
}
export type ISellerProfile = SellerProfile;

// Client-level types (External/Safe)
export type { ISafeUser, ISafeSellerProfile, ILoginCredentials, IRegisterData };