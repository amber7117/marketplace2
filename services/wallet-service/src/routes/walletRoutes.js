const express = require( 'express' );
const { body, query, param } = require( 'express-validator' );
const walletController = require( '../controllers/walletController' );
const authMiddleware = require( '../middleware/auth' );
const validate = require( '../middleware/validate' );

const router = express.Router();

// Apply auth middleware to all routes
router.use( authMiddleware );

/**
 * @route   GET /wallet
 * @desc    Get user wallet
 * @access  Private
 */
router.get( '/', walletController.getWallet );

/**
 * @route   POST /wallet/deposit
 * @desc    Deposit to wallet
 * @access  Private
 */
router.post(
    '/deposit',
    [
        body( 'amount' )
            .isFloat( { min: 0.01 } )
            .withMessage( 'Amount must be a positive number' ),
        body( 'paymentMethod' )
            .isIn( [ 'stripe', 'razer', 'fpx', 'usdt', 'bank_transfer' ] )
            .withMessage( 'Invalid payment method' ),
        body( 'paymentDetails' )
            .optional()
            .isObject()
            .withMessage( 'Payment details must be an object' ),
    ],
    validate,
    walletController.deposit
);

/**
 * @route   POST /wallet/deduct
 * @desc    Deduct from wallet (Service-to-Service)
 * @access  Private
 */
router.post(
    '/deduct',
    [
        body( 'userId' )
            .isMongoId()
            .withMessage( 'Valid user ID is required' ),
        body( 'amount' )
            .isFloat( { min: 0.01 } )
            .withMessage( 'Amount must be a positive number' ),
        body( 'reference' )
            .optional()
            .isObject()
            .withMessage( 'Reference must be an object' ),
        body( 'description' )
            .optional()
            .isString()
            .withMessage( 'Description must be a string' ),
        body( 'metadata' )
            .optional()
            .isObject()
            .withMessage( 'Metadata must be an object' ),
    ],
    validate,
    walletController.deduct
);

/**
 * @route   POST /wallet/refund
 * @desc    Refund to wallet (Service-to-Service)
 * @access  Private
 */
router.post(
    '/refund',
    [
        body( 'userId' )
            .isMongoId()
            .withMessage( 'Valid user ID is required' ),
        body( 'amount' )
            .isFloat( { min: 0.01 } )
            .withMessage( 'Amount must be a positive number' ),
        body( 'reference' )
            .optional()
            .isObject()
            .withMessage( 'Reference must be an object' ),
        body( 'description' )
            .optional()
            .isString()
            .withMessage( 'Description must be a string' ),
        body( 'metadata' )
            .optional()
            .isObject()
            .withMessage( 'Metadata must be an object' ),
    ],
    validate,
    walletController.refund
);

/**
 * @route   GET /wallet/transactions
 * @desc    Get transaction history
 * @access  Private
 */
router.get(
    '/transactions',
    [
        query( 'type' )
            .optional()
            .isIn( [ 'deposit', 'withdraw', 'deduct', 'refund', 'transfer_in', 'transfer_out', 'fee', 'bonus', 'adjustment' ] )
            .withMessage( 'Invalid transaction type' ),
        query( 'status' )
            .optional()
            .isIn( [ 'pending', 'completed', 'failed', 'cancelled', 'reversed' ] )
            .withMessage( 'Invalid status' ),
        query( 'startDate' )
            .optional()
            .isISO8601()
            .withMessage( 'Invalid start date' ),
        query( 'endDate' )
            .optional()
            .isISO8601()
            .withMessage( 'Invalid end date' ),
        query( 'page' )
            .optional()
            .isInt( { min: 1 } )
            .withMessage( 'Page must be a positive integer' ),
        query( 'limit' )
            .optional()
            .isInt( { min: 1, max: 100 } )
            .withMessage( 'Limit must be between 1 and 100' ),
    ],
    validate,
    walletController.getTransactions
);

/**
 * @route   GET /wallet/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get(
    '/transactions/:id',
    [
        param( 'id' )
            .isMongoId()
            .withMessage( 'Invalid transaction ID' ),
    ],
    validate,
    walletController.getTransaction
);

/**
 * @route   POST /wallet/:userId/freeze
 * @desc    Freeze wallet (Admin only)
 * @access  Private (Admin)
 */
router.post(
    '/:userId/freeze',
    authMiddleware,
    ( req, res, next ) => {
        if ( req.user.role !== 'admin' ) {
            return res.status( 403 ).json( {
                success: false,
                error: 'Admin access required',
            } );
        }
        next();
    },
    [
        param( 'userId' )
            .isMongoId()
            .withMessage( 'Invalid user ID' ),
        body( 'reason' )
            .notEmpty()
            .withMessage( 'Reason is required' ),
    ],
    validate,
    walletController.freezeWallet
);

/**
 * @route   POST /wallet/:userId/unfreeze
 * @desc    Unfreeze wallet (Admin only)
 * @access  Private (Admin)
 */
router.post(
    '/:userId/unfreeze',
    authMiddleware,
    ( req, res, next ) => {
        if ( req.user.role !== 'admin' ) {
            return res.status( 403 ).json( {
                success: false,
                error: 'Admin access required',
            } );
        }
        next();
    },
    [
        param( 'userId' )
            .isMongoId()
            .withMessage( 'Invalid user ID' ),
    ],
    validate,
    walletController.unfreezeWallet
);

/**
 * @route   GET /wallet/admin/stats
 * @desc    Get wallet statistics (Admin only)
 * @access  Private (Admin)
 */
router.get(
    '/admin/stats',
    authMiddleware,
    ( req, res, next ) => {
        if ( req.user.role !== 'admin' ) {
            return res.status( 403 ).json( {
                success: false,
                error: 'Admin access required',
            } );
        }
        next();
    },
    [
        query( 'startDate' )
            .optional()
            .isISO8601()
            .withMessage( 'Invalid start date' ),
        query( 'endDate' )
            .optional()
            .isISO8601()
            .withMessage( 'Invalid end date' ),
    ],
    validate,
    walletController.getWalletStats
);

module.exports = router;
