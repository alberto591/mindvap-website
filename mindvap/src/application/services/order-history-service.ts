
import { supabase } from '../../infrastructure/lib/supabase';
import { log } from '../../infrastructure/lib/logger';
import {
    GetOrdersRequest,
    GetOrdersResponse,
    GetOrderDetailsResponse,
    CreateOrderRequest,
    CreateOrderResponse
} from '../../domain/entities/auth';

/**
 * SRP: Handles user order history and prerequisites
 */
export class OrderHistoryService {
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
        `, { count: 'exact' })
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

    static async validateOrderPrerequisites(): Promise<{ valid: boolean; missing: string[] }> {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { valid: false, missing: ['authentication'] };
            }

            const missing: string[] = [];

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
