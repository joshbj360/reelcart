import type { Prisma } from '../../../../prisma/generated/client';
import type { IProfile, ISellerProfile } from "../../types/auth.types";

export interface AuthRepositoryInterface {
    findByEmail(email: string): Promise<IProfile | null>;
    findProfileById(id: string): Promise<IProfile | null>;
    createProfile(data: Partial<IProfile>): Promise<IProfile>;
    findOrCreateProfile(userData: Partial<IProfile>): Promise<IProfile>;

    // Seller profile
    findSellerBySlug(slug: string): Promise<ISellerProfile | null>;
    createSellerProfile(profileId:string, data:Partial<Prisma.SellerProfileCreateInput>): Promise<ISellerProfile>;

}