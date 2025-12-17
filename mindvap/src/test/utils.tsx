import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';

// Test wrapper component that provides all necessary providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestWrapper, ...options });

// Mock user data
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  email_confirmed_at: '2023-01-01T00:00:00Z',
  last_sign_in_at: '2023-01-01T00:00:00Z',
  raw_user_meta_data: {
    first_name: 'John',
    last_name: 'Doe',
  },
};

// Mock product data
export const mockProduct = {
  id: 'product-123',
  name: 'Test Herbal Blend',
  description: 'A test herbal blend for testing purposes',
  price: 39.99,
  category: 'Relaxation',
  herbs: ['Lavender', 'Chamomile'],
  image: '/images/test-product.png',
  stockLevel: 50,
  isActive: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

// Mock cart item
export const mockCartItem = {
  product: mockProduct,
  quantity: 2,
};

// Mock order data
export const mockOrder = {
  id: 'order-123',
  user_id: 'user-123',
  stripe_payment_intent_id: 'pi_test_123',
  status: 'completed' as const,
  total_amount: 85.98,
  currency: 'usd',
  shipping_address: {
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Test St',
    city: 'Test City',
    state: 'CA',
    zipCode: '12345',
    country: 'US',
  },
  customer_email: 'test@example.com',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
};

// Mock shipping address
export const mockShippingAddress = {
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Test St',
  city: 'Test City',
  state: 'CA',
  zipCode: '12345',
  country: 'US',
};

// Mock European shipping address
export const mockEuropeanShippingAddress = {
  firstName: 'Hans',
  lastName: 'Müller',
  address: 'Musterstraße 123',
  city: 'Berlin',
  state: 'Berlin',
  zipCode: '10115',
  country: 'DE',
};

// Mock chat message
export const mockChatMessage = {
  id: 'message-123',
  session_id: 'session-123',
  message_text: 'Hello, I need help',
  sender: 'user' as const,
  created_at: '2023-01-01T00:00:00Z',
};

// Helper function to create mock form data
export const createMockFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
};

// Helper function to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to mock successful API response
export const mockApiSuccess = (data: any) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

// Helper function to mock failed API response
export const mockApiError = (error: string, status = 400) => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({ error }),
  });
};

// Helper function to create test user in Supabase mock
export const createTestUser = () => {
  // This would typically interact with a test database
  return {
    ...mockUser,
    id: `user-${Date.now()}`,
  };
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render to include custom providers
export { customRender as render };
