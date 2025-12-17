Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { amount, currency = 'usd', cartItems, customerEmail, shippingAddress, billingAddress, userId = null, createAccount = false, password } = await req.json();

        console.log('Payment intent request received:', { amount, currency, cartItemsCount: cartItems?.length, userId, createAccount });

        // Validate required parameters
        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required');
        }

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            throw new Error('Cart items are required');
        }

        if (!customerEmail) {
            throw new Error('Customer email is required');
        }

        // Validate cart items structure
        for (const item of cartItems) {
            if (!item.product_id || !item.quantity || !item.price || !item.product_name) {
                throw new Error('Each cart item must have product_id, quantity, price, and product_name');
            }
            if (item.quantity <= 0 || item.price <= 0) {
                throw new Error('Cart item quantity and price must be positive');
            }
        }

        // Get environment variables
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey) {
            console.error('Stripe secret key not found in environment');
            throw new Error('Stripe secret key configured');
        }

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Environment variables validated, creating payment intent...');

        // Calculate total amount from cart items to verify
        const calculatedAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (Math.abs(calculatedAmount - amount) > 0.01) {
            throw new Error('Amount mismatch: calculated amount does not match provided amount');
        }

        // Generate order number for guest tracking
        const orderNumber = generateOrderNumber();
        console.log('Generated order number:', orderNumber);

        // Handle account creation if requested and no user is logged in
        let finalUserId = userId;
        if (createAccount && !userId && password) {
            try {
                console.log('Creating account for guest user...');
                const accountData = {
                    email: customerEmail,
                    password: password,
                    email_confirm: true,
                    user_metadata: {
                        first_name: shippingAddress.firstName,
                        last_name: shippingAddress.lastName,
                        created_via: 'guest_checkout',
                        order_number: orderNumber
                    }
                };

                const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(accountData)
                });

                if (createUserResponse.ok) {
                    const userData = await createUserResponse.json();
                    finalUserId = userData.id;
                    console.log('Account created successfully:', finalUserId);
                } else {
                    const errorData = await createUserResponse.text();
                    console.error('Failed to create account:', errorData);
                    // Continue without creating account if it fails
                    console.log('Continuing without account creation');
                }
            } catch (error) {
                console.error('Error creating account:', error.message);
                // Continue without creating account if it fails
                console.log('Continuing without account creation due to error');
            }
        }

        // Prepare Stripe payment intent data
        const stripeParams = new URLSearchParams();
        stripeParams.append('amount', Math.round(amount * 100).toString()); // Convert to cents
        stripeParams.append('currency', currency);
        stripeParams.append('payment_method_types[]', 'card');
        stripeParams.append('metadata[customer_email]', customerEmail || '');
        stripeParams.append('metadata[cart_items_count]', cartItems.length.toString());
        stripeParams.append('metadata[total_items]', cartItems.reduce((sum, item) => sum + item.quantity, 0).toString());
        stripeParams.append('metadata[user_id]', finalUserId || '');
        stripeParams.append('metadata[order_number]', orderNumber);
        stripeParams.append('metadata[account_created]', createAccount ? 'true' : 'false');

        // Create payment intent with Stripe
        const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeSecretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: stripeParams.toString()
        });

        console.log('Stripe API response status:', stripeResponse.status);

        if (!stripeResponse.ok) {
            const errorData = await stripeResponse.text();
            console.error('Stripe API error:', errorData);
            throw new Error(`Stripe API error: ${errorData}`);
        }

        const paymentIntent = await stripeResponse.json();
        console.log('Payment intent created successfully:', paymentIntent.id);

        // Create order record in database
        const orderData = {
            user_id: finalUserId,
            stripe_payment_intent_id: paymentIntent.id,
            status: 'pending',
            total_amount: amount,
            currency: currency,
            shipping_address: shippingAddress || null,
            billing_address: billingAddress || null,
            customer_email: customerEmail || null,
            order_number: orderNumber,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        console.log('Creating order in database...');

        const orderResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(orderData)
        });

        if (!orderResponse.ok) {
            const errorText = await orderResponse.text();
            console.error('Failed to create order:', errorText);
            // If order creation fails, we should cancel the payment intent
            try {
                await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntent.id}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${stripeSecretKey}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                console.log('Payment intent cancelled due to order creation failure');
            } catch (cancelError) {
                console.error('Failed to cancel payment intent:', cancelError.message);
            }
            throw new Error(`Failed to create order: ${errorText}`);
        }

        const order = await orderResponse.json();
        const orderId = order[0].id;
        console.log('Order created successfully:', orderId);

        // Create order items
        const orderItems = cartItems.map(item => ({
            order_id: orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: item.price,
            product_name: item.product_name,
            product_image_url: item.product_image_url || null,
            created_at: new Date().toISOString()
        }));

        console.log('Creating order items...');

        const orderItemsResponse = await fetch(`${supabaseUrl}/rest/v1/order_items`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderItems)
        });

        if (!orderItemsResponse.ok) {
            const errorText = await orderItemsResponse.text();
            console.error('Failed to create order items:', errorText);
            console.warn('Order created but order items creation failed');
        } else {
            console.log('Order items created successfully');
        }

        const result = {
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                orderId: orderId,
                orderNumber: orderNumber,
                amount: amount,
                currency: currency,
                status: 'pending'
            }
        };

        console.log('Payment intent creation completed successfully');

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Payment intent creation error:', error);

        const errorResponse = {
            error: {
                code: 'PAYMENT_INTENT_FAILED',
                message: error.message,
                timestamp: new Date().toISOString()
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});

// Helper function to generate order number
function generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MV-${timestamp.slice(-6)}${random}`;
}
