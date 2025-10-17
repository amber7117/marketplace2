const Order = require( '../models/Order' );
const axios = require( 'axios' );
const { validationResult } = require( 'express-validator' );

// Service URLs from environment
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const WALLET_SERVICE_URL = process.env.WALLET_SERVICE_URL || 'http://localhost:3004';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';

// @desc    Create new order
// @route   POST /orders
// @access  Private
const createOrder = async ( req, res, next ) => {
    try {
        const errors = validationResult( req );
        if ( !errors.isEmpty() ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Validation failed',
                details: errors.array()
            } );
        }

        const { items, payment } = req.body;
        const userId = req.headers[ 'x-user-id' ];
        const userEmail = req.headers[ 'x-user-email' ] || req.body.email;

        if ( !userId ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'User not authenticated'
            } );
        }

        // Step 1: Validate and fetch product details
        const orderItems = [];
        let subtotal = 0;

        for ( const item of items ) {
            try {
                // Fetch product details from Product Service
                const productResponse = await axios.get(
                    `${ PRODUCT_SERVICE_URL }/products/${ item.product }`
                );

                if ( !productResponse.data.success ) {
                    return res.status( 404 ).json( {
                        success: false,
                        error: `Product ${ item.product } not found`
                    } );
                }

                const product = productResponse.data.data;

                // Check if product is active and in stock
                if ( !product.isActive ) {
                    return res.status( 400 ).json( {
                        success: false,
                        error: `Product ${ product.name } is not available`
                    } );
                }

                if ( !product.stock.isUnlimited && product.stock.quantity < item.quantity ) {
                    return res.status( 400 ).json( {
                        success: false,
                        error: `Insufficient stock for ${ product.name }. Available: ${ product.stock.quantity }`
                    } );
                }

                // Calculate prices
                const unitPrice = product.pricing.discountPrice || product.pricing.basePrice;
                const totalPrice = unitPrice * item.quantity;

                orderItems.push( {
                    product: product._id,
                    productName: product.name,
                    productType: product.productType,
                    quantity: item.quantity,
                    unitPrice,
                    totalPrice
                } );

                subtotal += totalPrice;
            } catch ( error ) {
                console.error( 'Error fetching product:', error.message );
                return res.status( 503 ).json( {
                    success: false,
                    error: 'Product service temporarily unavailable'
                } );
            }
        }

        // Step 2: Create order
        const order = await Order.create( {
            user: userId,
            userEmail,
            items: orderItems,
            payment: {
                method: payment.method,
                amount: subtotal,
                currency: payment.currency || 'USD'
            },
            totals: {
                subtotal,
                tax: 0,
                discount: 0,
                total: subtotal
            },
            customerInfo: {
                ipAddress: req.ip,
                userAgent: req.headers[ 'user-agent' ]
            }
        } );

        // Step 3: Process payment based on method
        if ( payment.method === 'wallet' ) {
            try {
                // Deduct from wallet
                const walletResponse = await axios.post(
                    `${ WALLET_SERVICE_URL }/wallet/deduct`,
                    {
                        userId,
                        amount: subtotal,
                        reference: order.orderNumber,
                        description: `Order ${ order.orderNumber }`
                    }
                );

                if ( walletResponse.data.success ) {
                    // Update order status
                    order.status = 'paid';
                    order.payment.status = 'completed';
                    order.payment.paidAt = new Date();
                    order.payment.transactionId = walletResponse.data.data.transactionId;

                    // Reserve stock
                    await reserveStock( orderItems );

                    // Trigger delivery
                    if ( process.env.ENABLE_AUTO_DELIVERY === 'true' ) {
                        await processDelivery( order );
                    }

                    await order.save();
                } else {
                    order.status = 'cancelled';
                    order.cancellationReason = 'Insufficient wallet balance';
                    await order.save();

                    return res.status( 400 ).json( {
                        success: false,
                        error: 'Insufficient wallet balance'
                    } );
                }
            } catch ( error ) {
                console.error( 'Wallet deduction error:', error.message );
                order.status = 'cancelled';
                order.cancellationReason = 'Payment processing failed';
                await order.save();

                return res.status( 503 ).json( {
                    success: false,
                    error: 'Payment processing failed'
                } );
            }
        } else {
            // For other payment methods (stripe, razer, etc.)
            // Create payment intent and return payment URL
            try {
                const paymentResponse = await axios.post(
                    `${ PAYMENT_SERVICE_URL }/payments`,
                    {
                        order: order._id,
                        amount: subtotal,
                        currency: payment.currency || 'USD',
                        gateway: payment.method,
                        userId
                    }
                );

                if ( paymentResponse.data.success ) {
                    order.payment.transactionId = paymentResponse.data.data.transactionId;
                    await order.save();

                    return res.status( 201 ).json( {
                        success: true,
                        data: order,
                        paymentUrl: paymentResponse.data.data.paymentUrl,
                        message: 'Order created successfully. Please complete payment.'
                    } );
                }
            } catch ( error ) {
                console.error( 'Payment service error:', error.message );
                // Order created but payment initialization failed
            }
        }

        // Send notification
        await sendNotification( {
            type: 'order_created',
            userId,
            email: userEmail,
            data: {
                orderNumber: order.orderNumber,
                total: order.totals.total
            }
        } );

        res.status( 201 ).json( {
            success: true,
            data: order,
            message: 'Order created successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get all orders for user
// @route   GET /orders
// @access  Private
const getOrders = async ( req, res, next ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const userRole = req.headers[ 'x-user-role' ];

        const page = parseInt( req.query.page ) || 1;
        const limit = parseInt( req.query.limit ) || 10;
        const skip = ( page - 1 ) * limit;

        // Build filter
        const filter = {};

        // If not admin, only show user's own orders
        if ( userRole !== 'admin' ) {
            filter.user = userId;
        }

        if ( req.query.status ) {
            filter.status = req.query.status;
        }

        if ( req.query.orderNumber ) {
            filter.orderNumber = req.query.orderNumber;
        }

        // Date range filter
        if ( req.query.startDate || req.query.endDate ) {
            filter.createdAt = {};
            if ( req.query.startDate ) {
                filter.createdAt.$gte = new Date( req.query.startDate );
            }
            if ( req.query.endDate ) {
                filter.createdAt.$lte = new Date( req.query.endDate );
            }
        }

        const orders = await Order.find( filter )
            .sort( { createdAt: -1 } )
            .limit( limit )
            .skip( skip )
            .lean();

        const total = await Order.countDocuments( filter );

        res.status( 200 ).json( {
            success: true,
            data: orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil( total / limit )
            }
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get single order
// @route   GET /orders/:id
// @access  Private
const getOrder = async ( req, res, next ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const userRole = req.headers[ 'x-user-role' ];

        const order = await Order.findById( req.params.id );

        if ( !order ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Order not found'
            } );
        }

        // Check if user owns this order (unless admin)
        if ( userRole !== 'admin' && order.user.toString() !== userId ) {
            return res.status( 403 ).json( {
                success: false,
                error: 'Not authorized to access this order'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            data: order
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get order by order number
// @route   GET /orders/number/:orderNumber
// @access  Private
const getOrderByNumber = async ( req, res, next ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const userRole = req.headers[ 'x-user-role' ];

        const order = await Order.findOne( { orderNumber: req.params.orderNumber } );

        if ( !order ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Order not found'
            } );
        }

        // Check if user owns this order (unless admin)
        if ( userRole !== 'admin' && order.user.toString() !== userId ) {
            return res.status( 403 ).json( {
                success: false,
                error: 'Not authorized to access this order'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            data: order
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Cancel order
// @route   POST /orders/:id/cancel
// @access  Private
const cancelOrder = async ( req, res, next ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const userRole = req.headers[ 'x-user-role' ];
        const { reason } = req.body;

        const order = await Order.findById( req.params.id );

        if ( !order ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Order not found'
            } );
        }

        // Check if user owns this order (unless admin)
        if ( userRole !== 'admin' && order.user.toString() !== userId ) {
            return res.status( 403 ).json( {
                success: false,
                error: 'Not authorized to cancel this order'
            } );
        }

        // Check if order can be cancelled
        if ( ![ 'pending', 'paid' ].includes( order.status ) ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Order cannot be cancelled at this stage'
            } );
        }

        // If already paid, process refund
        if ( order.status === 'paid' && order.payment.method === 'wallet' ) {
            try {
                await axios.post( `${ WALLET_SERVICE_URL }/wallet/refund`, {
                    userId: order.user.toString(),
                    amount: order.totals.total,
                    reference: order.orderNumber,
                    description: `Refund for order ${ order.orderNumber }`
                } );

                // Release stock
                await releaseStock( order.items );
            } catch ( error ) {
                console.error( 'Refund error:', error.message );
                return res.status( 500 ).json( {
                    success: false,
                    error: 'Failed to process refund'
                } );
            }
        }

        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason || 'Cancelled by user';
        await order.save();

        // Send notification
        await sendNotification( {
            type: 'order_cancelled',
            userId: order.user.toString(),
            email: order.userEmail,
            data: {
                orderNumber: order.orderNumber
            }
        } );

        res.status( 200 ).json( {
            success: true,
            data: order,
            message: 'Order cancelled successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Update order status (Admin only)
// @route   PATCH /orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async ( req, res, next ) => {
    try {
        const { status } = req.body;

        const order = await Order.findById( req.params.id );

        if ( !order ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Order not found'
            } );
        }

        const oldStatus = order.status;
        order.status = status;

        // Handle status-specific logic
        if ( status === 'completed' ) {
            order.completedAt = new Date();
        }

        await order.save();

        // Send notification if status changed
        if ( oldStatus !== status ) {
            await sendNotification( {
                type: 'order_status_updated',
                userId: order.user.toString(),
                email: order.userEmail,
                data: {
                    orderNumber: order.orderNumber,
                    status
                }
            } );
        }

        res.status( 200 ).json( {
            success: true,
            data: order,
            message: 'Order status updated successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Process payment callback
// @route   POST /orders/callback/:gateway
// @access  Public (webhook)
const paymentCallback = async ( req, res, next ) => {
    try {
        const { gateway } = req.params;
        const payload = req.body;

        // Verify webhook signature (implementation depends on gateway)
        // For now, we'll assume it's verified

        // Extract order information from payload
        const { orderId, status, transactionId } = payload;

        const order = await Order.findById( orderId );

        if ( !order ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Order not found'
            } );
        }

        if ( status === 'success' || status === 'completed' ) {
            order.status = 'paid';
            order.payment.status = 'completed';
            order.payment.paidAt = new Date();
            order.payment.transactionId = transactionId;

            // Reserve stock
            await reserveStock( order.items );

            // Trigger delivery
            if ( process.env.ENABLE_AUTO_DELIVERY === 'true' ) {
                await processDelivery( order );
            }

            await order.save();

            // Send notification
            await sendNotification( {
                type: 'payment_success',
                userId: order.user.toString(),
                email: order.userEmail,
                data: {
                    orderNumber: order.orderNumber,
                    total: order.totals.total
                }
            } );
        } else if ( status === 'failed' ) {
            order.payment.status = 'failed';
            order.status = 'cancelled';
            order.cancellationReason = 'Payment failed';
            await order.save();
        }

        res.status( 200 ).json( {
            success: true,
            message: 'Callback processed successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get order statistics (Admin only)
// @route   GET /orders/stats
// @access  Private/Admin
const getOrderStats = async ( req, res, next ) => {
    try {
        const stats = await Order.aggregate( [
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totals.total' }
                }
            }
        ] );

        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate( [
            { $match: { status: { $in: [ 'delivered', 'completed' ] } } },
            { $group: { _id: null, total: { $sum: '$totals.total' } } }
        ] );

        res.status( 200 ).json( {
            success: true,
            data: {
                totalOrders,
                totalRevenue: totalRevenue[ 0 ]?.total || 0,
                byStatus: stats
            }
        } );
    } catch ( error ) {
        next( error );
    }
};

// Helper function: Reserve stock
async function reserveStock( items ) {
    for ( const item of items ) {
        try {
            await axios.patch(
                `${ PRODUCT_SERVICE_URL }/products/${ item.product }/stock`,
                {
                    quantity: item.quantity,
                    operation: 'subtract'
                }
            );
        } catch ( error ) {
            console.error( `Failed to reserve stock for product ${ item.product }:`, error.message );
        }
    }
}

// Helper function: Release stock
async function releaseStock( items ) {
    for ( const item of items ) {
        try {
            await axios.patch(
                `${ PRODUCT_SERVICE_URL }/products/${ item.product }/stock`,
                {
                    quantity: item.quantity,
                    operation: 'add'
                }
            );
        } catch ( error ) {
            console.error( `Failed to release stock for product ${ item.product }:`, error.message );
        }
    }
}

// Helper function: Process delivery
async function processDelivery( order ) {
    try {
        order.delivery.status = 'processing';

        // For instant digital delivery
        if ( order.delivery.method === 'instant' ) {
            // Generate or fetch delivery codes
            // This is a placeholder - implement actual code generation/fetching logic
            const deliveryCodes = [];

            for ( const item of order.items ) {
                // Generate random codes for demo
                const codes = Array( item.quantity ).fill( null ).map( () =>
                    `CODE-${ Math.random().toString( 36 ).substring( 2, 10 ).toUpperCase() }`
                );
                deliveryCodes.push( ...codes );

                // Update item with delivery code
                item.deliveryCode = codes.join( ', ' );
            }

            order.delivery.codes = deliveryCodes;
            order.delivery.status = 'delivered';
            order.delivery.deliveredAt = new Date();
            order.status = 'delivered';

            await order.save();

            // Send delivery notification
            await sendNotification( {
                type: 'order_delivered',
                userId: order.user.toString(),
                email: order.userEmail,
                data: {
                    orderNumber: order.orderNumber,
                    codes: deliveryCodes
                }
            } );
        }
    } catch ( error ) {
        console.error( 'Delivery processing error:', error.message );
        order.delivery.status = 'failed';
        order.delivery.notes = error.message;
        await order.save();
    }
}

// Helper function: Send notification
async function sendNotification( payload ) {
    try {
        await axios.post(
            `${ NOTIFICATION_SERVICE_URL }/notifications/send`,
            payload
        );
    } catch ( error ) {
        console.error( 'Notification error:', error.message );
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrder,
    getOrderByNumber,
    cancelOrder,
    updateOrderStatus,
    paymentCallback,
    getOrderStats
};
