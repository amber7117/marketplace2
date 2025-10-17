/**
 * Cloudflare Worker for Payment Service
 * Payment processing service using Cloudflare D1 database
 */

export default {
    async fetch( request, env, ctx ) {
        const url = new URL( request.url );
        const path = url.pathname;

        // Set CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        };

        // Handle preflight requests
        if ( request.method === 'OPTIONS' ) {
            return new Response( null, {
                headers: corsHeaders,
            } );
        }

        try {
            // Initialize database if needed
            await initializeDatabase( env.DB );

            // Route requests
            if ( path === '/health' ) {
                return handleHealth( request, env, corsHeaders );
            } else if ( path === '/api/payments/create' && request.method === 'POST' ) {
                return handleCreatePayment( request, env, corsHeaders );
            } else if ( path === '/api/payments/process' && request.method === 'POST' ) {
                return handleProcessPayment( request, env, corsHeaders );
            } else if ( path === '/api/payments/status' && request.method === 'GET' ) {
                return handleGetPaymentStatus( request, env, corsHeaders );
            } else if ( path === '/api/payments/history' && request.method === 'GET' ) {
                return handleGetPaymentHistory( request, env, corsHeaders );
            } else if ( path === '/api/payments/webhook' && request.method === 'POST' ) {
                return handleWebhook( request, env, corsHeaders );
            } else {
                return jsonResponse( {
                    error: 'Not found',
                    message: 'Available endpoints: /health, /api/payments/create, /api/payments/process, /api/payments/status, /api/payments/history, /api/payments/webhook'
                }, 404, corsHeaders );
            }
        } catch ( error ) {
            console.error( 'Payment Worker error:', error );
            return jsonResponse( {
                error: 'Internal server error',
                message: error.message
            }, 500, corsHeaders );
        }
    },
};

// Initialize database tables
async function initializeDatabase( db ) {
    try {
        await db.exec( `
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_id TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        gateway_response TEXT,
        transaction_id TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await db.exec( `
      CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        provider TEXT NOT NULL,
        details TEXT,
        is_default INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    } catch ( error ) {
        console.error( 'Database initialization error:', error );
    }
}

// Health check endpoint
async function handleHealth( request, env, corsHeaders ) {
    try {
        // Test database connection
        await env.DB.prepare( 'SELECT 1' ).run();

        return jsonResponse( {
            status: 'healthy',
            service: 'payment-service',
            timestamp: new Date().toISOString(),
            database: 'connected',
            gateways: {
                stripe: true,
                razer: true,
                fpx: true,
                usdt: true
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        return jsonResponse( {
            status: 'unhealthy',
            service: 'payment-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        }, 503, corsHeaders );
    }
}

// Create payment
async function handleCreatePayment( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { orderId, amount, currency, paymentMethod } = await request.json();

        if ( !orderId || !amount || !paymentMethod ) {
            return jsonResponse( {
                success: false,
                error: 'Order ID, amount, and payment method are required'
            }, 400, corsHeaders );
        }

        if ( amount <= 0 ) {
            return jsonResponse( {
                success: false,
                error: 'Valid amount is required'
            }, 400, corsHeaders );
        }

        // Create payment record
        const result = await env.DB.prepare(
            'INSERT INTO payments (user_id, order_id, amount, currency, payment_method, status) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind( userId, orderId, amount, currency || 'USD', paymentMethod, 'pending' ).run();

        const paymentId = result.meta.last_row_id;

        return jsonResponse( {
            success: true,
            message: 'Payment created successfully',
            data: {
                paymentId: paymentId,
                orderId: orderId,
                amount: amount,
                currency: currency || 'USD',
                paymentMethod: paymentMethod,
                status: 'pending'
            }
        }, 201, corsHeaders );
    } catch ( error ) {
        console.error( 'Create payment error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to create payment'
        }, 500, corsHeaders );
    }
}

// Process payment
async function handleProcessPayment( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { paymentId, paymentDetails } = await request.json();

        if ( !paymentId ) {
            return jsonResponse( {
                success: false,
                error: 'Payment ID is required'
            }, 400, corsHeaders );
        }

        // Get payment record
        const payment = await env.DB.prepare(
            'SELECT * FROM payments WHERE id = ? AND user_id = ?'
        ).bind( paymentId, userId ).first();

        if ( !payment ) {
            return jsonResponse( {
                success: false,
                error: 'Payment not found'
            }, 404, corsHeaders );
        }

        if ( payment.status !== 'pending' ) {
            return jsonResponse( {
                success: false,
                error: `Payment already ${ payment.status }`
            }, 400, corsHeaders );
        }

        // Simulate payment processing
        // In a real implementation, this would integrate with actual payment gateways
        const transactionId = generateTransactionId();
        const gatewayResponse = JSON.stringify( {
            transaction_id: transactionId,
            status: 'success',
            timestamp: new Date().toISOString()
        } );

        // Update payment status
        await env.DB.prepare(
            'UPDATE payments SET status = ?, transaction_id = ?, gateway_response = ?, updated_at = ? WHERE id = ?'
        ).bind( 'completed', transactionId, gatewayResponse, new Date().toISOString(), paymentId ).run();

        return jsonResponse( {
            success: true,
            message: 'Payment processed successfully',
            data: {
                paymentId: paymentId,
                transactionId: transactionId,
                status: 'completed',
                amount: payment.amount,
                currency: payment.currency
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Process payment error:', error );
        return jsonResponse( {
            success: false,
            error: 'Payment processing failed'
        }, 500, corsHeaders );
    }
}

// Get payment status
async function handleGetPaymentStatus( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const url = new URL( request.url );
        const paymentId = url.searchParams.get( 'paymentId' );
        const orderId = url.searchParams.get( 'orderId' );

        if ( !paymentId && !orderId ) {
            return jsonResponse( {
                success: false,
                error: 'Payment ID or Order ID is required'
            }, 400, corsHeaders );
        }

        let payment;
        if ( paymentId ) {
            payment = await env.DB.prepare(
                'SELECT * FROM payments WHERE id = ? AND user_id = ?'
            ).bind( paymentId, userId ).first();
        } else {
            payment = await env.DB.prepare(
                'SELECT * FROM payments WHERE order_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1'
            ).bind( orderId, userId ).first();
        }

        if ( !payment ) {
            return jsonResponse( {
                success: false,
                error: 'Payment not found'
            }, 404, corsHeaders );
        }

        return jsonResponse( {
            success: true,
            data: {
                id: payment.id,
                orderId: payment.order_id,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.payment_method,
                status: payment.status,
                transactionId: payment.transaction_id,
                createdAt: payment.created_at,
                updatedAt: payment.updated_at
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get payment status error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get payment status'
        }, 500, corsHeaders );
    }
}

// Get payment history
async function handleGetPaymentHistory( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const url = new URL( request.url );
        const limit = parseInt( url.searchParams.get( 'limit' ) ) || 50;
        const offset = parseInt( url.searchParams.get( 'offset' ) ) || 0;

        const payments = await env.DB.prepare(
            'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).bind( userId, limit, offset ).all();

        return jsonResponse( {
            success: true,
            data: payments.results.map( payment => ( {
                id: payment.id,
                orderId: payment.order_id,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.payment_method,
                status: payment.status,
                transactionId: payment.transaction_id,
                createdAt: payment.created_at
            } ) )
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get payment history error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get payment history'
        }, 500, corsHeaders );
    }
}

// Handle webhook
async function handleWebhook( request, env, corsHeaders ) {
    try {
        // For webhook endpoints, we need raw body
        const rawBody = await request.text();
        const signature = request.headers.get( 'X-Signature' );

        // Verify webhook signature (simplified)
        if ( !verifyWebhookSignature( rawBody, signature ) ) {
            return jsonResponse( {
                success: false,
                error: 'Invalid signature'
            }, 401, corsHeaders );
        }

        const webhookData = JSON.parse( rawBody );

        // Process webhook based on provider
        if ( webhookData.provider === 'stripe' ) {
            await processStripeWebhook( webhookData, env.DB );
        } else if ( webhookData.provider === 'razer' ) {
            await processRazerWebhook( webhookData, env.DB );
        } else if ( webhookData.provider === 'fpx' ) {
            await processFpxWebhook( webhookData, env.DB );
        } else if ( webhookData.provider === 'usdt' ) {
            await processUsdtWebhook( webhookData, env.DB );
        }

        return jsonResponse( {
            success: true,
            message: 'Webhook processed successfully'
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Webhook error:', error );
        return jsonResponse( {
            success: false,
            error: 'Webhook processing failed'
        }, 500, corsHeaders );
    }
}

// Webhook processing functions (simplified)
async function processStripeWebhook( data, db ) {
    // Process Stripe webhook
    console.log( 'Processing Stripe webhook:', data );
    // Update payment status based on Stripe webhook data
}

async function processRazerWebhook( data, db ) {
    // Process Razer webhook
    console.log( 'Processing Razer webhook:', data );
    // Update payment status based on Razer webhook data
}

async function processFpxWebhook( data, db ) {
    // Process FPX webhook
    console.log( 'Processing FPX webhook:', data );
    // Update payment status based on FPX webhook data
}

async function processUsdtWebhook( data, db ) {
    // Process USDT webhook
    console.log( 'Processing USDT webhook:', data );
    // Update payment status based on USDT webhook data
}

// Helper functions
function jsonResponse( data, status = 200, corsHeaders = {} ) {
    return new Response( JSON.stringify( data, null, 2 ), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    } );
}

// Extract user ID from Authorization header (simplified)
function getUserIdFromAuth( request ) {
    const authHeader = request.headers.get( 'Authorization' );
    if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) ) {
        return null;
    }

    // In a real implementation, you would verify the JWT token
    // and extract the user ID from the payload
    // For now, we'll use a simplified approach
    try {
        const token = authHeader.substring( 7 );
        // This is a simplified token parsing - in production use proper JWT verification
        const parts = token.split( '.' );
        if ( parts.length === 3 ) {
            const payload = JSON.parse( atob( parts[ 1 ] ) );
            return payload.id || payload.userId;
        }
    } catch ( error ) {
        console.error( 'Token parsing error:', error );
    }

    return null;
}

function generateTransactionId() {
    return 'txn_' + Array.from( crypto.getRandomValues( new Uint8Array( 16 ) ) )
        .map( b => b.toString( 16 ).padStart( 2, '0' ) )
        .join( '' );
}

function verifyWebhookSignature( body, signature ) {
    // Simplified webhook signature verification
    // In production, use proper signature verification for each payment gateway
    return !!signature; // Always return true for demo purposes
}
