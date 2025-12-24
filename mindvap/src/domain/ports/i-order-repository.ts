import { Order, OrderItem, CreateOrderData } from '../entities/order';

export interface IOrderRepository {
    createOrder(orderData: CreateOrderData): Promise<Order>;
    getOrder(orderId: string): Promise<Order | null>;
    getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null>;
    getUserOrders(userId: string, limit?: number): Promise<Order[]>;
    getOrderItems(orderId: string): Promise<OrderItem[]>;
    updateOrderStatus(orderId: string, status: Order['status']): Promise<void>;
    getOrderStats(): Promise<any>;
}
