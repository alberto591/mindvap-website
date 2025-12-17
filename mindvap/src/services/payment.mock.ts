/**
 * Mock Payment Service for Development Testing
 * Simulates Stripe payment integration without requiring external dependencies
 */

interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_image_url?: string;
}

interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  cartItems: CartItem[];
  customerEmail: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  userId?: string | null;
  createAccount?: boolean;
  password?: string;
}

interface CreatePaymentIntentResponse {
  data: {
    clientSecret: string;
    paymentIntentId: string;
    orderId: string;
    orderNumber: string;
    amount: number;
    currency: string;
    status: string;
  };
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock data
const generateMockOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `MV-${timestamp.slice(-6)}${random}`;
};

const generateMockClientSecret = (): string => {
  const random = Math.random().toString(36).substring(2, 15);
  return `pi_mock_${random}_secret_${Math.random().toString(36).substring(2, 8)}`;
};

const generateMockPaymentIntentId = (): string => {
  return `pi_mock_${Math.random().toString(36).substring(2, 15)}`;
};

const generateMockOrderId = (): string => {
  return `order_mock_${Math.random().toString(36).substring(2, 15)}`;
};

export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  console.log('🎭 Mock Payment Service: Creating payment intent');
  console.log('Mock request data:', {
    amount: request.amount,
    currency: request.currency,
    cartItemsCount: request.cartItems?.length,
    customerEmail: request.customerEmail,
    shippingAddress: request.shippingAddress,
    userId: request.userId,
    createAccount: request.createAccount
  });

  // Simulate network delay
  await delay(1000 + Math.random() * 1000);

  try {
    // Validate required parameters
    if (!request.amount || request.amount <= 0) {
      throw new Error('Valid amount is required');
    }

    if (!request.cartItems || !Array.isArray(request.cartItems) || request.cartItems.length === 0) {
      throw new Error('Cart items are required');
    }

    if (!request.customerEmail) {
      throw new Error('Customer email is required');
    }

    // Validate cart items structure
    for (const item of request.cartItems) {
      if (!item.product_id || !item.quantity || !item.price || !item.product_name) {
        throw new Error('Each cart item must have product_id, quantity, price, and product_name');
      }
      if (item.quantity <= 0 || item.price <= 0) {
        throw new Error('Cart item quantity and price must be positive');
      }
    }

    // Calculate subtotal from cart items to verify structure
    const calculatedSubtotal = request.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // The request.amount should be the total amount including shipping and taxes
    // In a real implementation, this would be calculated on the server
    // For now, we just validate that the cart items are valid
    console.log('✅ Mock Payment Service: Cart validation passed', {
      cartSubtotal: calculatedSubtotal,
      providedAmount: request.amount,
      difference: Math.abs(calculatedSubtotal - request.amount)
    });

    console.log('✅ Mock Payment Service: Validation passed');

    // Handle account creation if requested and no user is logged in
    if (request.createAccount && !request.userId && request.password) {
      console.log('🎭 Mock Payment Service: Simulating account creation for guest user');
      // In a real implementation, this would create a user account
      // For now, we'll just log it
      console.log('Mock account created for:', request.customerEmail);
    }

    // Generate mock data
    const orderNumber = generateMockOrderNumber();
    const clientSecret = generateMockClientSecret();
    const paymentIntentId = generateMockPaymentIntentId();
    const orderId = generateMockOrderId();

    console.log('🎭 Mock Payment Service: Generated mock data', {
      orderNumber,
      clientSecret: clientSecret.substring(0, 20) + '...',
      paymentIntentId,
      orderId
    });

    // Simulate order creation in database (in a real app, this would save to Supabase)
    const mockOrderData = {
      id: orderId,
      orderNumber: orderNumber,
      userId: request.userId || null,
      stripePaymentIntentId: paymentIntentId,
      status: 'pending',
      totalAmount: request.amount,
      currency: request.currency || 'usd',
      shippingAddress: request.shippingAddress,
      billingAddress: request.billingAddress || request.shippingAddress,
      customerEmail: request.customerEmail,
      cartItems: request.cartItems,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store mock order in localStorage for testing (simulates database)
    const existingOrders = JSON.parse(localStorage.getItem('mock_orders') || '[]');
    existingOrders.push(mockOrderData);
    localStorage.setItem('mock_orders', JSON.stringify(existingOrders));

    console.log('🎭 Mock Payment Service: Order saved to mock database');

    // Simulate potential errors for testing (5% chance)
    if (Math.random() < 0.05) {
      console.log('🎭 Mock Payment Service: Simulating random error for testing');
      throw new Error('Simulated network error for testing purposes');
    }

    const result: CreatePaymentIntentResponse = {
      data: {
        clientSecret: clientSecret,
        paymentIntentId: paymentIntentId,
        orderId: orderId,
        orderNumber: orderNumber,
        amount: request.amount,
        currency: request.currency || 'usd',
        status: 'pending'
      }
    };

    console.log('🎭 Mock Payment Service: Payment intent created successfully');
    console.log('Mock response:', {
      orderNumber: result.data.orderNumber,
      amount: result.data.amount,
      currency: result.data.currency,
      status: result.data.status
    });

    return result;

  } catch (error) {
    console.error('🎭 Mock Payment Service: Error creating payment intent:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create payment intent');
  }
}

// Mock function to retrieve mock orders for testing
export function getMockOrders() {
  return JSON.parse(localStorage.getItem('mock_orders') || '[]');
}

// Mock function to clear mock orders for testing
export function clearMockOrders() {
  localStorage.removeItem('mock_orders');
  console.log('🎭 Mock Payment Service: Mock orders cleared');
}
