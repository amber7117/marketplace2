const Payment = require( '../models/Payment' );
const PaymentMethod = require( '../models/PaymentMethod' );
const GatewayFactory = require( '../gateways/gatewayFactory' );
const axios = require( 'axios' );

/**
 * @desc    Create new payment (topup/order/withdrawal)
 * @route   POST /api/payments
 * @access  Private
 */
exports.createPayment = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const {
            paymentType,
            amount,
            currency,
            gateway,
            metadata = {},
            paymentMethodId,
        } = req.body;

        // Validate required fields
        if ( !paymentType || !amount || !currency || !gateway ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Missing required fields',
            } );
        }

        // Validate amount
        if ( amount <= 0 ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Amount must be greater than 0',
            } );
        }

        // Validate gateway supports currency
        try {
            GatewayFactory.validateGatewayCurrency( gateway, currency );
        } catch ( error ) {
            return res.status( 400 ).json( {
                success: false,
                error: error.message,
            } );
        }

        // Calculate fees (example: 2.9% + 0.30 for Stripe)
        let processingFee = 0;
        if ( gateway === 'stripe' ) {
            processingFee = amount * 0.029 + 0.3;
        } else if ( gateway === 'razer' ) {
            processingFee = amount * 0.035;
        } else if ( gateway === 'fpx' ) {
            processingFee = 1.0; // Flat fee
        }

        // Create payment record
        const payment = new Payment( {
            userId,
            paymentType,
            amount,
            currency,
            gateway,
            status: 'pending',
            metadata: {
                ...metadata,
                orderId: metadata.orderId || null,
                walletId: metadata.walletId || null,
            },
            fee: {
                amount: processingFee,
                currency,
            },
        } );

        await payment.save();

        // Process payment based on gateway
        const gatewayInstance = GatewayFactory.getGateway( gateway );
        let gatewayResponse;

        switch ( gateway ) {
            case 'stripe':
                gatewayResponse = await gatewayInstance.createPaymentIntent(
                    amount,
                    currency,
                    {
                        paymentId: payment.paymentId,
                        userId,
                        paymentType,
                    }
                );

                if ( gatewayResponse.success ) {
                    payment.gatewayResponse = {
                        paymentIntentId: gatewayResponse.data.paymentIntentId,
                        clientSecret: gatewayResponse.data.clientSecret,
                    };
                }
                break;

            case 'razer':
                gatewayResponse = await gatewayInstance.createPayment(
                    amount,
                    currency,
                    payment.paymentId,
                    { userId, paymentType }
                );

                if ( gatewayResponse.success ) {
                    payment.gatewayResponse = {
                        transactionId: gatewayResponse.data.transactionId,
                        paymentUrl: gatewayResponse.data.paymentUrl,
                    };
                }
                break;

            case 'fpx':
                gatewayResponse = await gatewayInstance.createPayment(
                    amount,
                    payment.paymentId,
                    metadata.buyerName || 'Customer',
                    metadata.buyerEmail || '',
                    metadata.buyerBankId
                );

                if ( gatewayResponse.success ) {
                    payment.gatewayResponse = {
                        paymentUrl: gatewayResponse.data.paymentUrl,
                        paymentData: gatewayResponse.data.paymentData,
                    };
                }
                break;

            case 'usdt':
                gatewayResponse = await gatewayInstance.generatePaymentAddress( payment.paymentId );

                if ( gatewayResponse.success ) {
                    payment.gatewayResponse = {
                        address: gatewayResponse.data.address,
                        network: gatewayResponse.data.network,
                        qrCodeUrl: gatewayResponse.data.qrCodeUrl,
                    };
                }
                break;

            default:
                return res.status( 400 ).json( {
                    success: false,
                    error: 'Unsupported gateway',
                } );
        }

        if ( !gatewayResponse.success ) {
            payment.status = 'failed';
            payment.addTimeline( 'failed', `Gateway error: ${ gatewayResponse.error }` );
            await payment.save();

            return res.status( 500 ).json( {
                success: false,
                error: 'Payment gateway error',
                details: gatewayResponse.error,
            } );
        }

        // Update payment with gateway response
        payment.addTimeline( 'processing', 'Payment initiated with gateway' );
        await payment.save();

        res.status( 201 ).json( {
            success: true,
            data: {
                paymentId: payment.paymentId,
                amount: payment.amount,
                currency: payment.currency,
                gateway: payment.gateway,
                status: payment.status,
                gatewayData: payment.gatewayResponse,
            },
        } );
    } catch ( error ) {
        console.error( 'Create payment error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to create payment',
            details: error.message,
        } );
    }
};

/**
 * @desc    Get user payments
 * @route   GET /api/payments
 * @access  Private
 */
exports.getPayments = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const {
            paymentType,
            status,
            gateway,
            page = 1,
            limit = 20,
        } = req.query;

        const query = { userId };

        if ( paymentType ) query.paymentType = paymentType;
        if ( status ) query.status = status;
        if ( gateway ) query.gateway = gateway;

        const payments = await Payment.find( query )
            .sort( { createdAt: -1 } )
            .limit( limit * 1 )
            .skip( ( page - 1 ) * limit )
            .select( '-gatewayResponse -timeline' );

        const count = await Payment.countDocuments( query );

        res.json( {
            success: true,
            data: payments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil( count / limit ),
                totalItems: count,
                itemsPerPage: limit,
            },
        } );
    } catch ( error ) {
        console.error( 'Get payments error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch payments',
        } );
    }
};

/**
 * @desc    Get payment by ID
 * @route   GET /api/payments/:paymentId
 * @access  Private
 */
exports.getPayment = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { paymentId } = req.params;

        const payment = await Payment.findOne( { paymentId, userId } );

        if ( !payment ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Payment not found',
            } );
        }

        res.json( {
            success: true,
            data: payment,
        } );
    } catch ( error ) {
        console.error( 'Get payment error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch payment',
        } );
    }
};

/**
 * @desc    Handle payment webhook
 * @route   POST /api/payments/webhook/:gateway
 * @access  Public
 */
exports.handleWebhook = async ( req, res ) => {
    try {
        const { gateway } = req.params;
        const gatewayInstance = GatewayFactory.getGateway( gateway );

        let webhookData;

        // Process webhook based on gateway
        switch ( gateway ) {
            case 'stripe': {
                const signature = req.headers[ 'stripe-signature' ];
                const verification = gatewayInstance.verifyWebhookSignature(
                    req.body,
                    signature
                );

                if ( !verification.success ) {
                    return res.status( 400 ).json( {
                        success: false,
                        error: 'Invalid signature',
                    } );
                }

                webhookData = await gatewayInstance.handleWebhookEvent( verification.event );
                break;
            }
            case 'razer':
                webhookData = await gatewayInstance.handleCallback( req.body );
                break;

            case 'fpx':
                webhookData = await gatewayInstance.handleCallback( req.body );
                break;

            default:
                return res.status( 400 ).json( {
                    success: false,
                    error: 'Unsupported gateway',
                } );
        }

        if ( !webhookData.success ) {
            return res.status( 400 ).json( webhookData );
        }

        // Find payment and update status
        const paymentQuery = {};

        if ( gateway === 'stripe' ) {
            paymentQuery[ 'gatewayResponse.paymentIntentId' ] = webhookData.paymentIntentId;
        } else if ( gateway === 'razer' || gateway === 'fpx' ) {
            paymentQuery[ 'gatewayResponse.transactionId' ] = webhookData.data.transactionId;
        }

        const payment = await Payment.findOne( paymentQuery );

        if ( !payment ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Payment not found',
            } );
        }

        // Update payment status
        if ( webhookData.type === 'payment_completed' ) {
            await payment.markCompleted();

            // Call wallet service to credit balance (for topup)
            if ( payment.paymentType === 'topup' ) {
                try {
                    await axios.post(
                        `${ process.env.WALLET_SERVICE_URL }/api/wallets/deposit`,
                        {
                            userId: payment.userId,
                            amount: payment.amount,
                            currency: payment.currency,
                            type: 'topup',
                            referenceId: payment.paymentId,
                            metadata: {
                                gateway: payment.gateway,
                                paymentId: payment.paymentId,
                            },
                        },
                        {
                            headers: {
                                'x-user-id': payment.userId,
                            },
                        }
                    );
                } catch ( walletError ) {
                    console.error( 'Wallet credit error:', walletError );
                    // Log but don't fail webhook
                }
            }
        } else if ( webhookData.type === 'payment_failed' ) {
            await payment.markFailed( webhookData.error || 'Payment failed' );
        }

        await payment.save();

        res.json( {
            success: true,
            message: 'Webhook processed',
        } );
    } catch ( error ) {
        console.error( 'Webhook error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Webhook processing failed',
        } );
    }
};

/**
 * @desc    Cancel payment
 * @route   POST /api/payments/:paymentId/cancel
 * @access  Private
 */
exports.cancelPayment = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { paymentId } = req.params;

        const payment = await Payment.findOne( { paymentId, userId } );

        if ( !payment ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Payment not found',
            } );
        }

        if ( payment.status !== 'pending' && payment.status !== 'processing' ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Cannot cancel payment in current status',
            } );
        }

        payment.status = 'cancelled';
        payment.addTimeline( 'cancelled', 'Payment cancelled by user' );
        await payment.save();

        res.json( {
            success: true,
            message: 'Payment cancelled',
            data: payment,
        } );
    } catch ( error ) {
        console.error( 'Cancel payment error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to cancel payment',
        } );
    }
};

/**
 * @desc    Refund payment
 * @route   POST /api/payments/:paymentId/refund
 * @access  Private (Admin)
 */
exports.refundPayment = async ( req, res ) => {
    try {
        const { paymentId } = req.params;
        const { amount, reason } = req.body;

        const payment = await Payment.findOne( { paymentId } );

        if ( !payment ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Payment not found',
            } );
        }

        if ( payment.status !== 'completed' ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Can only refund completed payments',
            } );
        }

        // Process refund with gateway
        const gatewayInstance = GatewayFactory.getGateway( payment.gateway );
        let refundResponse;

        if ( payment.gateway === 'stripe' ) {
            const chargeId = payment.gatewayResponse.chargeId;
            refundResponse = await gatewayInstance.createRefund( chargeId, amount );

            if ( !refundResponse.success ) {
                return res.status( 500 ).json( {
                    success: false,
                    error: 'Refund failed',
                    details: refundResponse.error,
                } );
            }

            // Update payment
            payment.status = 'refunded';
            payment.refund = {
                amount: refundResponse.data.amount,
                currency: payment.currency,
                reason,
                processedAt: new Date(),
            };
            payment.addTimeline( 'refunded', `Refund processed: ${ reason }` );
            await payment.save();

            // Deduct from wallet if topup
            if ( payment.paymentType === 'topup' ) {
                try {
                    await axios.post(
                        `${ process.env.WALLET_SERVICE_URL }/api/wallets/deduct`,
                        {
                            userId: payment.userId,
                            amount: refundResponse.data.amount,
                            currency: payment.currency,
                            type: 'refund',
                            referenceId: payment.paymentId,
                        },
                        {
                            headers: {
                                'x-user-id': payment.userId,
                            },
                        }
                    );
                } catch ( walletError ) {
                    console.error( 'Wallet deduct error:', walletError );
                }
            }
        }

        res.json( {
            success: true,
            message: 'Refund processed successfully',
            data: payment,
        } );
    } catch ( error ) {
        console.error( 'Refund error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to process refund',
        } );
    }
};

/**
 * @desc    Get payment statistics
 * @route   GET /api/payments/stats
 * @access  Private (Admin)
 */
exports.getPaymentStats = async ( req, res ) => {
    try {
        const { startDate, endDate } = req.query;

        const matchStage = {};
        if ( startDate || endDate ) {
            matchStage.createdAt = {};
            if ( startDate ) matchStage.createdAt.$gte = new Date( startDate );
            if ( endDate ) matchStage.createdAt.$lte = new Date( endDate );
        }

        const stats = await Payment.aggregate( [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        status: '$status',
                        gateway: '$gateway',
                        paymentType: '$paymentType',
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    totalFees: { $sum: '$fee.amount' },
                },
            },
            {
                $group: {
                    _id: null,
                    byStatus: {
                        $push: {
                            status: '$_id.status',
                            count: '$count',
                            totalAmount: '$totalAmount',
                        },
                    },
                    byGateway: {
                        $push: {
                            gateway: '$_id.gateway',
                            count: '$count',
                            totalAmount: '$totalAmount',
                        },
                    },
                    byPaymentType: {
                        $push: {
                            paymentType: '$_id.paymentType',
                            count: '$count',
                            totalAmount: '$totalAmount',
                        },
                    },
                    totalTransactions: { $sum: '$count' },
                    totalRevenue: { $sum: '$totalAmount' },
                    totalFees: { $sum: '$totalFees' },
                },
            },
        ] );

        res.json( {
            success: true,
            data: stats[ 0 ] || {
                totalTransactions: 0,
                totalRevenue: 0,
                totalFees: 0,
                byStatus: [],
                byGateway: [],
                byPaymentType: [],
            },
        } );
    } catch ( error ) {
        console.error( 'Get stats error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch statistics',
        } );
    }
};

/**
 * @desc    Verify USDT payment
 * @route   POST /api/payments/:paymentId/verify-usdt
 * @access  Private
 */
exports.verifyUSDTPayment = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { paymentId } = req.params;
        const { txHash } = req.body;

        const payment = await Payment.findOne( { paymentId, userId, gateway: 'usdt' } );

        if ( !payment ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Payment not found',
            } );
        }

        const usdtGateway = GatewayFactory.getGateway( 'usdt' );
        const verification = await usdtGateway.verifyPayment(
            txHash,
            payment.amount,
            payment.gatewayResponse.address
        );

        if ( !verification.success || !verification.verified ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Payment verification failed',
                details: verification.error,
            } );
        }

        // Mark payment as completed
        payment.gatewayResponse.txHash = txHash;
        await payment.markCompleted();

        // Credit wallet
        if ( payment.paymentType === 'topup' ) {
            await axios.post(
                `${ process.env.WALLET_SERVICE_URL }/api/wallets/deposit`,
                {
                    userId: payment.userId,
                    amount: payment.amount,
                    currency: 'USDT',
                    type: 'topup',
                    referenceId: payment.paymentId,
                },
                {
                    headers: {
                        'x-user-id': payment.userId,
                    },
                }
            );
        }

        res.json( {
            success: true,
            message: 'Payment verified and completed',
            data: payment,
        } );
    } catch ( error ) {
        console.error( 'USDT verification error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to verify payment',
        } );
    }
};
