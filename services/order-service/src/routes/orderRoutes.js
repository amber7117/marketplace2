const express = require( 'express' );
const router = express.Router();
const { body } = require( 'express-validator' );
const {
    createOrder,
    getOrders,
    getOrder,
    getOrderByNumber,
    cancelOrder,
    updateOrderStatus,
    paymentCallback,
    getOrderStats
} = require( '../controllers/orderController' );

// Validation rules
const createOrderValidation = [
    body( 'items' ).isArray( { min: 1 } ).withMessage( 'At least one item is required' ),
    body( 'items.*.product' ).notEmpty().withMessage( 'Product ID is required' ),
    body( 'items.*.quantity' ).isInt( { min: 1 } ).withMessage( 'Valid quantity is required' ),
    body( 'payment.method' ).isIn( [ 'wallet', 'stripe', 'razer', 'fpx', 'usdt' ] )
        .withMessage( 'Valid payment method is required' )
];

const updateStatusValidation = [
    body( 'status' ).isIn( [ 'pending', 'paid', 'delivering', 'delivered', 'completed', 'cancelled', 'refunded' ] )
        .withMessage( 'Valid status is required' )
];

// Public routes (webhooks)
router.post( '/callback/:gateway', paymentCallback );

// Protected routes (require authentication via API Gateway)
router.post( '/', createOrderValidation, createOrder );
router.get( '/', getOrders );
router.get( '/stats', getOrderStats );
router.get( '/number/:orderNumber', getOrderByNumber );
router.get( '/:id', getOrder );
router.post( '/:id/cancel', cancelOrder );

// Admin only routes
router.patch( '/:id/status', updateStatusValidation, updateOrderStatus );

module.exports = router;
