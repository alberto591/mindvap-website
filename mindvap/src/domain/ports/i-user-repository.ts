import { User } from '../entities/auth';

/**
 * User Repository - Focused on core user entity operations only (ISP, SRP)
 * Address, wishlist, and payment methods are now in separate repositories
 */
export interface IUserRepository {
    // Core user operations
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    updateUser(userId: string, updates: Partial<User>): Promise<void>;
    deleteUser(userId: string): Promise<void>;

    // User verification
    verifyEmail(userId: string): Promise<void>;
    updateLastLogin(userId: string): Promise<void>;
}
