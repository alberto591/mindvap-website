import { User } from '../entities/auth';

export interface UserAddress {
    id: string;
    user_id: string;
    type: 'billing' | 'shipping' | 'both';
    is_default: boolean;
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateAddressRequest {
    type: 'billing' | 'shipping' | 'both';
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
}

export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
}

export interface IUserRepository {
    // User management
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;

    // Address management
    getAddresses(userId: string): Promise<UserAddress[]>;
    getAddressById(addressId: string): Promise<UserAddress | null>;
    createAddress(userId: string, address: CreateAddressRequest): Promise<UserAddress>;
    updateAddress(addressId: string, updates: Partial<UserAddress>): Promise<void>;
    deleteAddress(addressId: string): Promise<void>;
    setDefaultAddress(addressId: string, type: 'billing' | 'shipping' | 'both'): Promise<void>;

    // Wishlist management
    getWishlist(userId: string): Promise<WishlistItem[]>;
    addToWishlist(userId: string, productId: string): Promise<void>;
    removeFromWishlist(userId: string, productId: string): Promise<void>;
    isInWishlist(userId: string, productId: string): Promise<boolean>;
}
