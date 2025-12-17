// Template for CheckoutPage.tsx with Stripe integration
// This file shows the structure needed once STRIPE_PUBLISHABLE_KEY is available

/*
STEPS TO INTEGRATE:

1. Install Stripe packages:
   cd /workspace/mindvap && pnpm add @stripe/stripe-js @stripe/react-stripe-js

2. Create .env file with:
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxx

3. Replace CheckoutPage.tsx with this implementation

4. Create CheckoutForm.tsx component (see below)
*/

// CheckoutPage.tsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CartItem } from '../types';
import CheckoutForm from '../components/CheckoutForm';

// Initialize Stripe (will use env variable)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutPageProps {
  cart: CartItem[];
  clearCart: () => void;
}

export default function CheckoutPage({ cart, clearCart }: CheckoutPageProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal >= 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#4a6b5a',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  const createPaymentIntent = async (formData: any) => {
    setLoading(true);
    setError('');

    try {
      // Prepare cart items for backend
      const cartItems = cart.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        product_image_url: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Call Supabase edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: total,
            currency: 'usd',
            cartItems,
            customerEmail: formData.email,
            shippingAddress: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country,
            },
            billingAddress: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              address: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      setClientSecret(data.data.clientSecret);
      setOrderId(data.data.orderId);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-background-primary min-h-screen py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="font-serif text-4xl mb-4">Cart is Empty</h1>
          <p className="text-text-secondary">Add items to your cart before checkout.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-text-primary">
          Secure Checkout
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!clientSecret ? (
          // Initial form to collect shipping info and create payment intent
          <div>
            {/* Form to collect shipping address - triggers createPaymentIntent */}
            {/* This would be a separate component */}
          </div>
        ) : (
          // Stripe Elements form
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm 
              orderId={orderId}
              cart={cart}
              total={total}
              clearCart={clearCart}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}


// CheckoutForm.tsx (Stripe Elements component)
/*
import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

interface CheckoutFormProps {
  orderId: string;
  cart: any[];
  total: number;
  clearCart: () => void;
}

export default function CheckoutForm({ orderId, cart, total, clearCart }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError('');

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?order_id=${orderId}`,
      },
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setProcessing(false);
    } else {
      // Payment succeeded
      clearCart();
      navigate(`/order-confirmation?order_id=${orderId}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-cta hover:bg-cta-hover text-white font-semibold py-4 rounded-full mt-6 disabled:opacity-50"
      >
        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
*/
