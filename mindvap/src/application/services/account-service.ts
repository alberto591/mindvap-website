// Account Service
// Comprehensive service for all account management operations

import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import {
  UserAddress,
  CreateAddressRequest,
  UpdateAddressRequest,
  AddressResponse,
  Order,
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  GetOrderDetailsResponse,
  PaymentMethod,
  CreatePaymentMethodRequest,
  CreatePaymentMethodResponse,
  GetPaymentMethodsResponse,
  DeletePaymentMethodRequest,
  DeletePaymentMethodResponse,
  SetDefaultPaymentMethodRequest,
  SetDefaultPaymentMethodResponse,
  WishlistItem,
  AddWishlistItemRequest,
  AddWishlistItemResponse,
  GetWishlistResponse,
  RemoveWishlistItemRequest,
  RemoveWishlistItemResponse,
  MoveWishlistToCartRequest,
  MoveWishlistToCartResponse,
  UserActivity,
  GetUserActivityRequest,
  GetUserActivityResponse,
  DashboardStats,
  GetDashboardStatsResponse
} from '../../domain/entities/auth';

export class AccountService {
  // Address Management
  static async getAddresses(): Promise<AddressResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, message: 'Addresses retrieved successfully', address: data?.[0] };
    } catch (error) {
      log.error('Get addresses error', error);
      return { success: false, message: 'Failed to retrieve addresses', error: { code: 'GET_ADDRESSES_ERROR', message: 'Failed to retrieve addresses' } };
    }
  }

  static async getAllAddresses(): Promise<{ success: boolean; addresses: UserAddress[]; error?: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, addresses: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, addresses: data || [] };
    } catch (error) {
      log.error('Get all addresses error', error);
      return { success: false, addresses: [], error };
    }
  }

  static async createAddress(addressData: CreateAddressRequest): Promise<AddressResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', addressData.type);
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: user.id,
          type: addressData.type,
          is_default: addressData.isDefault || false,
          first_name: addressData.firstName,
          last_name: addressData.lastName,
          company: addressData.company,
          address_line_1: addressData.addressLine1,
          address_line_2: addressData.addressLine2,
          city: addressData.city,
          state_province: addressData.stateProvince,
          postal_code: addressData.postalCode,
          country: addressData.country,
          phone: addressData.phone
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: 'Address created successfully', address: data };
    } catch (error) {
      log.error('Create address error', error, { addressData });
      return { success: false, message: 'Failed to create address', error: { code: 'CREATE_ADDRESS_ERROR', message: 'Failed to create address' } };
    }
  }

  static async updateAddress(addressData: UpdateAddressRequest): Promise<AddressResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id)
          .eq('type', addressData.type)
          .neq('id', addressData.id);
      }

      const updateData: any = {};
      if (addressData.firstName) updateData.first_name = addressData.firstName;
      if (addressData.lastName) updateData.last_name = addressData.lastName;
      if (addressData.company) updateData.company = addressData.company;
      if (addressData.addressLine1) updateData.address_line_1 = addressData.addressLine1;
      if (addressData.addressLine2) updateData.address_line_2 = addressData.addressLine2;
      if (addressData.city) updateData.city = addressData.city;
      if (addressData.stateProvince) updateData.state_province = addressData.stateProvince;
      if (addressData.postalCode) updateData.postal_code = addressData.postalCode;
      if (addressData.country) updateData.country = addressData.country;
      if (addressData.phone !== undefined) updateData.phone = addressData.phone;
      if (addressData.isDefault !== undefined) updateData.is_default = addressData.isDefault;
      if (addressData.type) updateData.type = addressData.type;

      const { data, error } = await supabase
        .from('user_addresses')
        .update(updateData)
        .eq('id', addressData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: 'Address updated successfully', address: data };
    } catch (error) {
      log.error('Update address error', error, { addressData });
      return { success: false, message: 'Failed to update address', error: { code: 'UPDATE_ADDRESS_ERROR', message: 'Failed to update address' } };
    }
  }

  static async deleteAddress(id: string): Promise<AddressResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
      }

      const { error } = await supabase
        .from('user_addresses')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true, message: 'Address deleted successfully' };
    } catch (error) {
      log.error('Delete address error', error, { id });
      return { success: false, message: 'Failed to delete address', error: { code: 'DELETE_ADDRESS_ERROR', message: 'Failed to delete address' } };
    }
  }

  static async setDefaultAddress(id: string, type: 'billing' | 'shipping' | 'both'): Promise<AddressResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated', error: { code: 'NOT_AUTHENTICATED', message: 'User not authenticated' } };
      }

      // Unset all defaults for this type
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('type', type);

      // Set the new default
      const { data, error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: 'Default address set successfully', address: data };
    } catch (error) {
      log.error('Set default address error', error, { id, type });
      return { success: false, message: 'Failed to set default address', error: { code: 'SET_DEFAULT_ADDRESS_ERROR', message: 'Failed to set default address' } };
    }
  }

  // Order Management
  static async getOrders(request: GetOrdersRequest = {}): Promise<GetOrdersResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated', orders: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
      }

      const page = request.page || 1;
      const limit = request.limit || 10;
      const offset = (page - 1) * limit;

      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          shipping_address:user_addresses!orders_shipping_address_id_fkey(*),
          billing_address:user_addresses!orders_billing_address_id_fkey(*)
        `)
        .eq('user_id', user.id);

      if (request.status) {
        query = query.eq('status', request.status);
      }

      const { data, error, count } = await query
        .order(request.sortBy || 'created_at', { ascending: request.sortOrder === 'asc' })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        orders: data || [],
        pagination: { page, limit, total, totalPages }
      };
    } catch (error) {
      log.error('Get orders error', error, { request });
      return { success: false, message: 'Failed to retrieve orders', orders: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
  }

  static async getOrderDetails(orderId: string): Promise<GetOrderDetailsResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          shipping_address:user_addresses!orders_shipping_address_id_fkey(*),
          billing_address:user_addresses!orders_billing_address_id_fkey(*)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return { success: true, order: data };
    } catch (error) {
      log.error('Get order details error', error, { orderId });
      return { success: false, message: 'Failed to retrieve order details' };
    }
  }

  static async createOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Generate order number
      const orderNumber = `MV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          shipping_address_id: orderData.shippingAddressId,
          billing_address_id: orderData.billingAddressId,
          payment_method_id: orderData.paymentMethodId,
          notes: orderData.notes
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: 'Order created successfully', order: data };
    } catch (error) {
      log.error('Create order error', error, { orderData });
      return { success: false, message: 'Failed to create order' };
    }
  }

  // Payment Method Management
  static async getPaymentMethods(): Promise<GetPaymentMethodsResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated', paymentMethods: [] };
      }

      const { data, error } = await supabase
        .from('user_payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, paymentMethods: data || [] };
    } catch (error) {
      log.error('Get payment methods error', error);
      return { success: false, message: 'Failed to retrieve payment methods', paymentMethods: [] };
    }
  }

  static async createPaymentMethod(paymentData: CreatePaymentMethodRequest): Promise<CreatePaymentMethodResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // In a real implementation, you would integrate with Stripe here
      // For now, we'll create a mock payment method
      const { data, error } = await supabase
        .from('user_payment_methods')
        .insert({
          user_id: user.id,
          type: paymentData.type,
          last4: paymentData.cardNumber.slice(-4),
          brand: 'Visa', // This would come from Stripe
          exp_month: paymentData.expMonth,
          exp_year: paymentData.expYear,
          is_default: paymentData.isDefault || false,
          stripe_payment_method_id: `pm_mock_${Date.now()}`
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: 'Payment method created successfully', paymentMethod: data };
    } catch (error) {
      log.error('Create payment method error', error, { paymentData });
      return { success: false, message: 'Failed to create payment method' };
    }
  }

  static async deletePaymentMethod(id: string): Promise<DeletePaymentMethodResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('user_payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true, message: 'Payment method deleted successfully' };
    } catch (error) {
      log.error('Delete payment method error', error, { id });
      return { success: false, message: 'Failed to delete payment method' };
    }
  }

  static async setDefaultPaymentMethod(id: string): Promise<SetDefaultPaymentMethodResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Unset all defaults
      await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set the new default
      const { data, error } = await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, message: 'Default payment method set successfully' };
    } catch (error) {
      log.error('Set default payment method error', error, { id });
      return { success: false, message: 'Failed to set default payment method' };
    }
  }

  // Wishlist Management
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

      // Check if item already exists
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

      // Get wishlist item
      const { data: wishlistItem, error: wishlistError } = await supabase
        .from('user_wishlist')
        .select('*, product:products(*)')
        .eq('id', wishlistItemId)
        .eq('user_id', user.id)
        .single();

      if (wishlistError || !wishlistItem) {
        return { success: false, message: 'Wishlist item not found' };
      }

      // In a real implementation, you would add this to the user's cart
      // For now, we'll just remove from wishlist
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

  // User Activity
  static async getUserActivity(request: GetUserActivityRequest = {}): Promise<GetUserActivityResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated', activities: [] };
      }

      const limit = request.limit || 10;

      let query = supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id);

      if (request.type) {
        query = query.eq('type', request.type);
      }

      if (request.since) {
        query = query.gte('created_at', request.since);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, activities: data || [] };
    } catch (error) {
      log.error('Get user activity error', error, { request });
      return { success: false, message: 'Failed to retrieve user activity', activities: [] };
    }
  }

  // Dashboard Stats
  static async getDashboardStats(): Promise<GetDashboardStatsResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      // Get basic stats
      const [ordersResult, wishlistResult, activityResult] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total, created_at, status')
          .eq('user_id', user.id),
        supabase
          .from('user_wishlist')
          .select('id')
          .eq('user_id', user.id),
        supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const orders = ordersResult.data || [];
      const wishlistCount = wishlistResult.data?.length || 0;
      const recentActivity = activityResult.data || [];

      const totalSpent = orders
        .filter(order => ['delivered', 'shipped'].includes(order.status))
        .reduce((sum, order) => sum + (order.total || 0), 0);

      const lastOrder = orders
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      const stats: DashboardStats = {
        totalOrders: orders.length,
        totalSpent,
        wishlistCount,
        lastOrderDate: lastOrder?.created_at,
        emailVerified: user.user_metadata?.email_verified || false,
        ageVerified: user.user_metadata?.age_verified || false,
        recentActivity
      };

      return { success: true, stats };
    } catch (error) {
      log.error('Get dashboard stats error', error);
      return { success: false, message: 'Failed to retrieve dashboard stats' };
    }
  }

  // Utility method to check if user has required data for orders
  static async validateOrderPrerequisites(): Promise<{ valid: boolean; missing: string[] }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { valid: false, missing: ['authentication'] };
      }

      const missing: string[] = [];

      // Check for default shipping address
      const { data: addresses } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'shipping')
        .eq('is_default', true)
        .eq('is_deleted', false);

      if (!addresses || addresses.length === 0) {
        missing.push('shipping_address');
      }

      // Check for default payment method
      const { data: paymentMethods } = await supabase
        .from('user_payment_methods')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_default', true);

      if (!paymentMethods || paymentMethods.length === 0) {
        missing.push('payment_method');
      }

      return { valid: missing.length === 0, missing };
    } catch (error) {
      log.error('Validate order prerequisites error', error);
      return { valid: false, missing: ['validation_error'] };
    }
  }
}