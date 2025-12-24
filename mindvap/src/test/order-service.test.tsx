import { OrderService } from '../services/order-service';
import { supabase } from '../lib/supabase';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn(),
            eq: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
        })),
    },
}));

describe('OrderService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockOrderData = {
        stripe_payment_intent_id: 'pi_123',
        total_amount: 50.00,
        currency: 'usd',
        shipping_address: {},
        cartItems: [
            { product_id: 'p1', quantity: 1, price: 50.00, product_name: 'P1' }
        ]
    };

    const mockOrderRecord = {
        id: 'o_123',
        ...mockOrderData
    };

    it('should create order successfully', async () => {
        const fromSpy = jest.spyOn(supabase, 'from');

        // Mock successful order creation
        (supabase.from as any).mockImplementationOnce(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrderRecord, error: null })
        }));

        // Mock successful order items creation
        (supabase.from as any).mockImplementationOnce(() => ({
            insert: jest.fn().mockResolvedValue({ error: null })
        }));

        const result = await OrderService.createOrder(mockOrderData);

        expect(result).toEqual(mockOrderRecord);
        expect(supabase.from).toHaveBeenCalledWith('orders');
        expect(supabase.from).toHaveBeenCalledWith('order_items');
    });

    it('should throw error if order creation fails', async () => {
        (supabase.from as any).mockImplementationOnce(() => ({
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } })
        }));

        await expect(OrderService.createOrder(mockOrderData)).rejects.toThrow('Failed to create order: DB Error');
    });

    it('should get order by ID', async () => {
        (supabase.from as any).mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockOrderRecord, error: null })
        }));

        const result = await OrderService.getOrder('o_123');
        expect(result).toEqual(mockOrderRecord);
    });

    it('should return null if order not found (PGRST116)', async () => {
        (supabase.from as any).mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
        }));

        const result = await OrderService.getOrder('o_999');
        expect(result).toBeNull();
    });

    it('should update order status', async () => {
        (supabase.from as any).mockImplementation(() => ({
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: null })
        }));

        await OrderService.updateOrderStatus('o_123', 'shipped');

        expect(supabase.from).toHaveBeenCalledWith('orders');
    });
});
