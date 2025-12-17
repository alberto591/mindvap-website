// Wishlist Page
// User wishlist management with add/remove items and move to cart

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AccountService } from '../services/accountService';
import { WishlistItem } from '../types/auth';
import AccountLayout from '../components/account/AccountLayout';

const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await AccountService.getWishlist();
      
      if (response.success) {
        setWishlistItems(response.items);
      } else {
        setMessage({ type: 'error', text: 'Failed to load wishlist' });
      }
    } catch (error) {
      console.error('Load wishlist error:', error);
      setMessage({ type: 'error', text: 'An error occurred while loading wishlist' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      const result = await AccountService.removeFromWishlist(id);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Item removed from wishlist' });
        loadWishlist();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to remove item' });
      }
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      setMessage({ type: 'error', text: 'An error occurred while removing item' });
    }
  };

  const handleMoveToCart = async (wishlistItemId: string) => {
    try {
      const result = await AccountService.moveWishlistToCart(wishlistItemId);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Item moved to cart' });
        loadWishlist();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to move item to cart' });
      }
    } catch (error) {
      console.error('Move to cart error:', error);
      setMessage({ type: 'error', text: 'An error occurred while moving item to cart' });
    }
  };

  if (loading) {
    return (
      <AccountLayout title="Wishlist">
        <div className="p-6">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout title="Wishlist">
      <div className="p-6">
        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                {message.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                )}
              </svg>
              {message.text}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Wishlist</h2>
          <p className="text-gray-600 mt-1">
            {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
          </p>
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Save items you love to your wishlist.</p>
            <div className="mt-6">
              <Link
                to="/shop"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <img
                    src={item.product?.image || '/images/placeholder-product.png'}
                    alt={item.product?.name || 'Product'}
                    className="w-full h-48 object-cover"
                  />
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {item.product?.name || 'Product Name'}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {item.product?.description || 'Product description'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900">
                      ${item.product?.price || '0.00'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Added {new Date(item.addedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/product/${item.productId}`}
                      className="flex-1 text-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleMoveToCart(item.id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Add to Cart
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="mt-2 w-full px-3 py-2 text-red-600 text-sm font-medium hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Remove from Wishlist
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default WishlistPage;