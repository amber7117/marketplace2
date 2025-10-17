/**
 * Cloudflare Worker for Order Service
 * Order management service using Cloudflare D1 database
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
            } else if ( path === '/orders' && request.method === 'POST' ) {
                return handleCreateOrder( request, env, corsHeaders );
            } else if ( path === '/orders' && request.method === 'GET' ) {
                return handleGetOrders( request, env, corsHeaders );
            } else if ( path.startsWith( '/orders/' ) && request.method === 'GET' ) {
                return handleGetOrder( request, env, corsHeaders, path );
            } else if ( path.startsWith( '/orders/' ) && request.method === 'PUT' ) {
                return handleUpdateOrder( request, env, corsHeaders, path );
            } else if ( path.startsWith( '/orders/' ) && request.method === 'DELETE' ) {
                return handleCancelOrder( request, env, corsHeaders, path );
            } else {
                return jsonResponse( {
                    error: 'Not found',
                    message: 'Available endpoints: /health, /orders, /orders/{id}'
                }, 404, corsHeaders );
            }
        } catch ( error ) {
            console.error( 'Order Worker error:', error );
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
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_number TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'pending',
        total_amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        items TEXT NOT NULL,
        shipping_address TEXT,
        billing_address TEXT,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'pending',
        shipping_method TEXT,
        tracking_number TEXT,
        notes TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await db.exec( `
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        variant TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
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
            service: 'order-service',
            timestamp: new Date().toISOString(),
            database: 'connected'
        }, 200, corsHeaders );
    } catch ( error ) {
        return jsonResponse( {
            status: 'unhealthy',
            service: 'order-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        }, 503, corsHeaders );
    }
}

// Create order
async function handleCreateOrder( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { items, shippingAddress, billingAddress, paymentMethod, notes } = await request.json();

        if ( !items || !Array.isArray( items ) || items.length === 0 ) {
            return jsonResponse( {
                success: false,
                error: 'Order items are required'
            }, 400, corsHeaders );
        }

        // Calculate total amount
        let totalAmount = 0;
        const orderItems = items.map( item => {
            const itemTotal = parseFloat( item.unitPrice ) * parseInt( item.quantity );
            totalAmount += itemTotal;
            return {
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: itemTotal.toFixed( 2 ),
                variant: item.variant || null,
                metadata: item.metadata || null
            };
        } );

        // Generate order number
        const orderNumber = generateOrderNumber();

        // Create order record
        const result = await env.DB.prepare(
            `INSERT INTO orders (user_id, order_number, total_amount, items, shipping_address, billing_address, payment_method, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
            userId,
            orderNumber,
            totalAmount.toFixed( 2 ),
            JSON.stringify( items ),
            JSON.stringify( shippingAddress || {} ),
            JSON.stringify( billingAddress || shippingAddress || {} ),
            paymentMethod || 'wallet',
            notes || ''
        ).run();

        const orderId = result.meta.last_row_id;

        // Create order items
        for ( const item of orderItems ) {
            await env.DB.prepare(
                `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price, variant, metadata) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
            ).bind(
                orderId,
                item.productId,
                item.productName,
                item.quantity,
                item.unitPrice,
                item.totalPrice,
                item.variant,
                JSON.stringify( item.metadata )
            ).run();
        }

        return jsonResponse( {
            success: true,
            message: 'Order created successfully',
            data: {
                orderId: orderId,
                orderNumber: orderNumber,
                totalAmount: totalAmount.toFixed( 2 ),
                status: 'pending',
                items: orderItems,
                createdAt: new Date().toISOString()
            }
        }, 201, corsHeaders );
    } catch ( error ) {
        console.error( 'Create order error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to create order'
        }, 500, corsHeaders );
    }
}

// Get orders (list)
async function handleGetOrders( request, env, corsHeaders ) {
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
        const status = url.searchParams.get( 'status' );

        let query = 'SELECT * FROM orders WHERE user_id = ?';
        const params = [ userId ];

        if ( status ) {
            query += ' AND status = ?';
            params.push( status );
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push( limit, offset );

        const orders = await env.DB.prepare( query ).bind( ...params ).all();

        // Get order items for each order
        const ordersWithItems = await Promise.all(
            orders.results.map( async order => {
                const items = await env.DB.prepare(
                    'SELECT * FROM order_items WHERE order_id = ?'
                ).bind( order.id ).all();

                return {
                    id: order.id,
                    orderNumber: order.order_number,
                    status: order.status,
                    totalAmount: order.total_amount,
                    currency: order.currency,
                    paymentMethod: order.payment_method,
                    paymentStatus: order.payment_status,
                    shippingMethod: order.shipping_method,
                    trackingNumber: order.tracking_number,
                    createdAt: order.created_at,
                    updatedAt: order.updated_at,
                    items: items.results.map( item => ( {
                        productId: item.product_id,
                        productName: item.product_name,
                        quantity: item.quantity,
                        unitPrice: item.unit_price,
                        totalPrice: item.total_price,
                        variant: item.variant
                    } ) )
                };
            } )
        );

        return jsonResponse( {
            success: true,
            data: ordersWithItems
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get orders error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get orders'
        }, 500, corsHeaders );
    }
}

// Get single order
async function handleGetOrder( request, env, corsHeaders, path ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const orderId = path.split( '/' ).pop();

        // Get order
        const order = await env.DB.prepare(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?'
        ).bind( orderId, userId ).first();

        if ( !order ) {
            return jsonResponse( {
                success: false,
                error: 'Order not found'
            }, 404, corsHeaders );
        }

        // Get order items
        const items = await env.DB.prepare(
            'SELECT * FROM order_items WHERE order_id = ?'
        ).bind( orderId ).all();

        return jsonResponse( {
            success: true,
            data: {
                id: order.id,
                orderNumber: order.order_number,
                status: order.status,
                totalAmount: order.total_amount,
                currency: order.currency,
                shippingAddress: JSON.parse( order.shipping_address || '{}' ),
                billingAddress: JSON.parse( order.billing_address || '{}' ),
                paymentMethod: order.payment_method,
                paymentStatus: order.payment_status,
                shippingMethod: order.shipping_method,
                trackingNumber: order.tracking_number,
                notes: order.notes,
                createdAt: order.created_at,
                updatedAt: order.updated_at,
                items: items.results.map( item => ( {
                    productId: item.product_id,
                    productName: item.product_name,
                    quantity: item.quantity,
                    unitPrice: item.unit_price,
                    totalPrice: item.total_price,
                    variant: item.variant
                } ) )
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get order error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get order'
        }, 500, corsHeaders );
    }
}

// Update order
async function handleUpdateOrder( request, env, corsHeaders, path ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const orderId = path.split( '/' ).pop();
        const { status, paymentStatus, trackingNumber, shippingMethod } = await request.json();

        // Check if order exists and belongs to user
        const order = await env.DB.prepare(
            'SELECT id FROM orders WHERE id = ? AND user_id = ?'
        ).bind( orderId, userId ).first();

        if ( !order ) {
            return jsonResponse( {
                success: false,
                error: 'Order not found'
            }, 404, corsHeaders );
        }

        // Build update query dynamically
        const updates = [];
        const params = [];

        if ( status ) {
            updates.push( 'status = ?' );
            params.push( status );
        }

        if ( paymentStatus ) {
            updates.push( 'payment_status = ?' );
            params.push( paymentStatus );
        }

        if ( trackingNumber ) {
            updates.push( 'tracking_number = ?' );
            params.push( trackingNumber );
        }

        if ( shippingMethod ) {
            updates.push( 'shipping_method = ?' );
            params.push( shippingMethod );
        }

        if ( updates.length === 0 ) {
            return jsonResponse( {
                success: false,
                error: 'No valid fields to update'
            }, 400, corsHeaders );
        }

        updates.push( 'updated_at = ?' );
        params.push( new Date().toISOString() );
        params.push( orderId );

        const query = `UPDATE orders SET ${ updates.join( ', ' ) } WHERE id = ?`;

        await env.DB.prepare( query ).bind( ...params ).run();

        return jsonResponse( {
            success: true,
            message: 'Order updated successfully'
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Update order error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to update order'
        }, 500, corsHeaders );
    }
}

// Cancel order
async function handleCancelOrder( request, env, corsHeaders, path ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const orderId = path.split( '/' ).pop();

        // Check if order exists and belongs to user
        const order = await env.DB.prepare(
            'SELECT id, status FROM orders WHERE id = ? AND user_id = ?'
        ).bind( orderId, userId ).first();

        if ( !order ) {
            return jsonResponse( {
                success: false,
                error: 'Order not found'
            }, 404, corsHeaders );
        }

        // Check if order can be cancelled
        if ( order.status === 'shipped' || order.status === 'delivered' || order.status === 'cancelled' ) {
            return jsonResponse( {
                success: false,
                error: `Cannot cancel order with status: ${ order.status }`
            }, 400, corsHeaders );
        }

        // Update order status to cancelled
        await env.DB.prepare(
            'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?'
        ).bind( 'cancelled', new Date().toISOString(), orderId ).run();

        return jsonResponse( {
            success: true,
            message: 'Order cancelled successfully'
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Cancel order error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to cancel order'
        }, 500, corsHeaders );
    }
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

function generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Array.from( crypto.getRandomValues( new Uint8Array( 4 ) ) )
        .map( b => b.toString( 16 ).padStart( 2, '0' ) )
        .join( '' );
    return `ORD-${ timestamp }-${ random }`;
}
