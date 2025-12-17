const SUPABASE_URL = 'https://myaujlsahkendspiloet.supabase.co';

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
}

interface CreatePaymentIntentResponse {
  data: {
    clientSecret: string;
    paymentIntentId: string;
    orderId: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to create payment intent');
  }

  return response.json();
}
