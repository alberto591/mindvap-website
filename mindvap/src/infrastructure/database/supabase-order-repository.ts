import { supabase } from '../lib/supabase';
import { IOrderRepository } from '../../domain/ports/i-order-repository';
import { Order, OrderItem, CreateOrderData } from '../../domain/entities/order';

export class SupabaseOrderRepository implements IOrderRepository {
    async createOrder(orderData: CreateOrderData): Promise<Order> {
        // Create order record
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: orderData.user_id,
                stripe_payment_intent_id: orderData.stripe_payment_intent_id,
                status: 'pending',
                total_amount: orderData.total_amount,
                currency: orderData.currency,
                shipping_address: orderData.shipping_address,
                billing_address: orderData.billing_address,
                customer_email: orderData.customer_email
            })
            .select()
            .single();

        if (orderError) {
            throw new Error(`Failed to create order: ${orderError.message}`);
        }

        // Create order items
        const orderItems = orderData.cartItems.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: item.price,
            product_name: item.product_name,
            product_image_url: item.product_image_url
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            // If order items creation fails, delete the order
            await supabase.from('orders').delete().eq('id', order.id);
            throw new Error(`Failed to create order items: ${itemsError.message}`);
        }

        return order;
    }

    async getOrder(orderId: string): Promise<Order | null> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data;
    }

    async getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('stripe_payment_intent_id', paymentIntentId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            throw error;
        }

        return data;
    }

    async getUserOrders(userId: string, limit = 10): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            throw error;
        }

        return data || [];
    }

    async getOrderItems(orderId: string): Promise<OrderItem[]> {
        const { data, error } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        return data || [];
    }

    async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            throw error;
        }
    }

    async getOrderStats(): Promise<any> {
        const { data, error } = await supabase
            .from('orders')
            .select('status, total_amount, created_at');

        if (error) {
            throw error;
        }

        return {
            total: data.length,
            pending: data.filter(o => o.status === 'pending').length,
            completed: data.filter(o => o.status === 'completed').length,
            failed: data.filter(o => o.status === 'failed').length,
            canceled: data.filter(o => o.status === 'canceled').length,
            totalRevenue: data
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + o.total_amount, 0)
        };
    }
}
