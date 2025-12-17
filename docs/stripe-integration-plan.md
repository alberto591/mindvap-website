# Stripe Payment Integration - Implementation Plan

## Current Status
The website currently has a simulated checkout. To complete the project, we need to integrate real Stripe payment processing.

## Required Credentials

### Stripe API Keys (Required from User)
- **STRIPE_SECRET_KEY**: Backend key for creating payment intents (set in Supabase secrets)
- **STRIPE_PUBLISHABLE_KEY**: Frontend key for Stripe Elements (set in environment variable)

### Supabase Authorization (Required from Coordinator)
- Supabase access token for creating database tables
- Supabase project ID for edge function deployment

## Implementation Steps

### Step 1: Database Setup (Pending Supabase Auth)
Create two tables:
1. **orders** - Store order records with payment intent IDs
2. **order_items** - Store individual products in each order

### Step 2: Edge Function Deployment (Pending Credentials)
Deploy `create-payment-intent` edge function that:
- Validates cart data
- Creates Stripe payment intent
- Stores order in database
- Returns client secret for frontend

### Step 3: Frontend Integration (Pending Stripe Publishable Key)
Update checkout page to:
- Install @stripe/stripe-js and @stripe/react-stripe-js
- Replace simulation with real Stripe Elements
- Handle payment confirmation
- Show success/error states

### Step 4: Testing
- Test payment flow end-to-end
- Verify order creation in database
- Test error handling

## Files Prepared
- ✅ `/workspace/supabase/functions/create-payment-intent/index.ts` - Edge function code
- ⏳ Frontend checkout page update (pending Stripe publishable key)
- ⏳ Database tables (pending Supabase auth)

## Next Actions Required
1. User provides Stripe API keys
2. Coordinator provides Supabase authorization
3. Deploy edge function with Stripe secret key
4. Update frontend with Stripe publishable key
5. Test complete payment flow
