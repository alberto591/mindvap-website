
import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import {
    GetWishlistResponse,
    AddWishlistItemResponse,
    RemoveWishlistItemResponse,
    MoveWishlistToCartResponse
} from '../../domain/entities/auth';

/**
 * SRP: Handles user wishlist management only
 */
export class WishlistService {
    static async getWishlist(): Promise<GetWishlistResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated', items: [] };
            }

            const { data, error } = await supabase
                .from('user_wishlist')
                .select(`
          *,
          product:products(*)
        `)
                .eq('user_id', user.id)
                .order('added_at', { ascending: false });

            if (error) throw error;

            return { success: true, items: data || [] };
        } catch (error) {
            log.error('Get wishlist error', error);
            return { success: false, message: 'Failed to retrieve wishlist', items: [] };
        }
    }

    static async addToWishlist(productId: string): Promise<AddWishlistItemResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            const { data: existing } = await supabase
                .from('user_wishlist')
                .select('id')
                .eq('user_id', user.id)
                .eq('product_id', productId)
                .single();

            if (existing) {
                return { success: false, message: 'Item already in wishlist' };
            }

            const { data, error } = await supabase
                .from('user_wishlist')
                .insert({
                    user_id: user.id,
                    product_id: productId
                })
                .select()
                .single();

            if (error) throw error;

            return { success: true, message: 'Item added to wishlist', wishlistItem: data };
        } catch (error) {
            log.error('Add to wishlist error', error, { productId });
            return { success: false, message: 'Failed to add item to wishlist' };
        }
    }

    static async removeFromWishlist(id: string): Promise<RemoveWishlistItemResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            const { error } = await supabase
                .from('user_wishlist')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            return { success: true, message: 'Item removed from wishlist' };
        } catch (error) {
            log.error('Remove from wishlist error', error, { id });
            return { success: false, message: 'Failed to remove item from wishlist' };
        }
    }

    static async moveWishlistToCart(wishlistItemId: string, quantity: number = 1): Promise<MoveWishlistToCartResponse> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { success: false, message: 'User not authenticated' };
            }

            const { data: wishlistItem, error: wishlistError } = await supabase
                .from('user_wishlist')
                .select('*, product:products(*)')
                .eq('id', wishlistItemId)
                .eq('user_id', user.id)
                .single();

            if (wishlistError || !wishlistItem) {
                return { success: false, message: 'Wishlist item not found' };
            }

            await supabase
                .from('user_wishlist')
                .delete()
                .eq('id', wishlistItemId)
                .eq('user_id', user.id);

            return {
                success: true,
                message: 'Item moved to cart',
                cartItem: {
                    product: wishlistItem.product,
                    quantity
                }
            };
        } catch (error) {
            log.error('Move wishlist to cart error', error, { wishlistItemId, quantity });
            return { success: false, message: 'Failed to move item to cart' };
        }
    }
}
