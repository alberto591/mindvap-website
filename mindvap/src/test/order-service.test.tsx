import { OrderService } from '../application/services/order-service';
import { IOrderRepository } from '../domain/ports/i-order-repository';

describe('OrderService', () => {
    let orderService: OrderService;
    let mockOrderRepository: jest.Mocked<IOrderRepository>;

    beforeEach(() => {
        mockOrderRepository = {
            createOrder: jest.fn(),
            getOrder: jest.fn(),
            getOrderByPaymentIntent: jest.fn(),
            getUserOrders: jest.fn(),
            getOrderItems: jest.fn(),
            updateOrderStatus: jest.fn(),
            getOrderStats: jest.fn(),
        };
        orderService = new OrderService(mockOrderRepository);
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
        stripe_payment_intent_id: 'pi_123',
        status: 'pending' as const,
        total_amount: 50.00,
        currency: 'usd',
        shipping_address: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    it('should create order successfully', async () => {
        mockOrderRepository.createOrder.mockResolvedValue(mockOrderRecord);

        const result = await orderService.createOrder(mockOrderData);

        expect(result).toEqual(mockOrderRecord);
        expect(mockOrderRepository.createOrder).toHaveBeenCalledWith(mockOrderData);
    });

    it('should throw error if order creation fails', async () => {
        mockOrderRepository.createOrder.mockRejectedValue(new Error('DB Error'));

        await expect(orderService.createOrder(mockOrderData)).rejects.toThrow('DB Error');
    });

    it('should get order by ID', async () => {
        mockOrderRepository.getOrder.mockResolvedValue(mockOrderRecord);

        const result = await orderService.getOrder('o_123');
        expect(result).toEqual(mockOrderRecord);
    });

    it('should return null if order not found', async () => {
        mockOrderRepository.getOrder.mockResolvedValue(null);

        const result = await orderService.getOrder('o_999');
        expect(result).toBeNull();
    });

    it('should update order status', async () => {
        mockOrderRepository.updateOrderStatus.mockResolvedValue(undefined);

        await orderService.updateOrderStatus('o_123', 'shipped');

        expect(mockOrderRepository.updateOrderStatus).toHaveBeenCalledWith('o_123', 'shipped');
    });
});
