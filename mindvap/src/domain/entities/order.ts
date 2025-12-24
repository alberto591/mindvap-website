export interface Order {
    id: string;
    user_id?: string;
    stripe_payment_intent_id: string;
    status: 'pending' | 'completed' | 'failed' | 'canceled' | 'shipped';
    total_amount: number;
    currency: string;
    shipping_address: any;
    billing_address?: any;
    customer_email?: string;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    product_name: string;
    product_image_url?: string;
    created_at: string;
}

export interface CreateOrderData {
    user_id?: string;
    stripe_payment_intent_id: string;
    total_amount: number;
    currency: string;
    shipping_address: any;
    billing_address?: any;
    customer_email?: string;
    cartItems: {
        product_id: string;
        quantity: number;
        price: number;
        product_name: string;
        product_image_url?: string;
    }[];
}
