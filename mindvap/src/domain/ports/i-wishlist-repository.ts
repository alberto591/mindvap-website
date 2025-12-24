export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
}

/**
 * Wishlist Repository - Focused on wishlist management only (ISP)
 */
export interface IWishlistRepository {
    getWishlist(userId: string): Promise<WishlistItem[]>;
    addToWishlist(userId: string, productId: string): Promise<WishlistItem>;
    removeFromWishlist(userId: string, wishlistItemId: string): Promise<void>;
    isInWishlist(userId: string, productId: string): Promise<boolean>;
    clearWishlist(userId: string): Promise<void>;
}
