import { createPaymentIntent } from '../application/services/payment';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Payment Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockRequest = {
    amount: 50.00,
    cartItems: [
      { product_id: '1', product_name: 'Herb', quantity: 1, price: 50.00 }
    ],
    customerEmail: 'test@example.com',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 St',
      city: 'City',
      state: 'State',
      zipCode: '12345',
      country: 'US'
    }
  };

  it('should create payment intent successfully', async () => {
    const mockResponse = {
      data: {
        clientSecret: 'secret_123',
        paymentIntentId: 'pi_123',
        orderId: 'order_123',
        orderNumber: 'MV-123456',
        amount: 5000,
        currency: 'usd',
        status: 'requires_payment_method'
      }
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const result = await createPaymentIntent(mockRequest);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/create-payment-intent'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockRequest)
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should throw error when payment intent creation fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Stripe error' } })
    });

    await expect(createPaymentIntent(mockRequest)).rejects.toThrow('Stripe error');
  });

  it('should throw default error when no message provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({})
    });

    await expect(createPaymentIntent(mockRequest)).rejects.toThrow('Failed to create payment intent');
  });
});
