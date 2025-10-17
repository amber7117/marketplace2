const express = require( 'express' );
const router = express.Router();
const {
    createPayment,
    getPayments,
    getPayment,
    handleWebhook,
    cancelPayment,
    refundPayment,
    getPaymentStats,
    verifyUSDTPayment,
} = require( '../controllers/paymentController' );
const { body } = require( 'express-validator' );
const { validate } = require( '../middleware/validator' );
const authMiddleware = require( '../middleware/auth' );

// Public routes
router.post( '/webhook/:gateway', handleWebhook );

// Protected routes
router.use( authMiddleware );

// Create payment
router.post(
    '/',
    [
        body( 'paymentType' )
            .isIn( [ 'topup', 'order', 'withdrawal' ] )
            .withMessage( 'Invalid payment type' ),
        body( 'amount' )
            .isFloat( { min: 0.01 } )
            .withMessage( 'Amount must be greater than 0' ),
        body( 'currency' )
            .isString()
            .notEmpty()
            .withMessage( 'Currency is required' ),
        body( 'gateway' )
            .isIn( [ 'stripe', 'razer', 'fpx', 'usdt', 'manual' ] )
            .withMessage( 'Invalid gateway' ),
        validate,
    ],
    createPayment
);

// Get user payments
router.get( '/', getPayments );

// Get payment statistics (admin only)
router.get( '/stats', getPaymentStats );

// Get single payment
router.get( '/:paymentId', getPayment );

// Cancel payment
router.post( '/:paymentId/cancel', cancelPayment );

// Refund payment (admin only)
router.post(
    '/:paymentId/refund',
    [
        body( 'reason' ).isString().notEmpty().withMessage( 'Refund reason is required' ),
        validate,
    ],
    refundPayment
);

// Verify USDT payment
router.post(
    '/:paymentId/verify-usdt',
    [
        body( 'txHash' ).isString().notEmpty().withMessage( 'Transaction hash is required' ),
        validate,
    ],
    verifyUSDTPayment
);

module.exports = router;
