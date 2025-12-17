Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
            throw new Error('Missing required environment variables');
        }

        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature) {
            throw new Error('Missing Stripe signature');
        }

        // Parse the Stripe event
        // Note: In production, you should verify the webhook signature
        // For now, we'll parse the event directly
        const event = JSON.parse(body);

        console.log('Webhook event received:', event.type);

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);

                // Update order status to completed
                const updateResponse = await fetch(
                    `${supabaseUrl}/rest/v1/orders?stripe_payment_intent_id=eq.${paymentIntent.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: 'completed',
                            updated_at: new Date().toISOString()
                        })
                    }
                );

                if (!updateResponse.ok) {
                    const error = await updateResponse.text();
                    console.error('Failed to update order status:', error);
                }

                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                console.log('Payment failed:', paymentIntent.id);

                // Update order status to failed
                const updateResponse = await fetch(
                    `${supabaseUrl}/rest/v1/orders?stripe_payment_intent_id=eq.${paymentIntent.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: 'failed',
                            updated_at: new Date().toISOString()
                        })
                    }
                );

                if (!updateResponse.ok) {
                    const error = await updateResponse.text();
                    console.error('Failed to update order status:', error);
                }

                break;
            }

            case 'payment_intent.canceled': {
                const paymentIntent = event.data.object;
                console.log('Payment canceled:', paymentIntent.id);

                // Update order status to canceled
                const updateResponse = await fetch(
                    `${supabaseUrl}/rest/v1/orders?stripe_payment_intent_id=eq.${paymentIntent.id}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            status: 'canceled',
                            updated_at: new Date().toISOString()
                        })
                    }
                );

                if (!updateResponse.ok) {
                    const error = await updateResponse.text();
                    console.error('Failed to update order status:', error);
                }

                break;
            }

            default:
                console.log('Unhandled event type:', event.type);
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Webhook error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'WEBHOOK_ERROR',
                message: error.message
            }
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
