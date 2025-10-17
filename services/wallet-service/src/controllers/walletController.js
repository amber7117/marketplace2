const Wallet = require( '../models/Wallet' );
const Transaction = require( '../models/Transaction' );
const axios = require( 'axios' );

/**
 * @desc    Get user wallet
 * @route   GET /wallet
 * @access  Private
 */
exports.getWallet = async ( req, res, next ) => {
    try {
        const userId = req.user.id;

        let wallet = await Wallet.findByUser( userId );

        // Create wallet if not exists
        if ( !wallet ) {
            wallet = await Wallet.create( {
                user: userId,
                userEmail: req.user.email,
                balance: 0,
                currency: process.env.DEFAULT_CURRENCY || 'MYR',
            } );
        }

        res.json( {
            success: true,
            data: {
                wallet: {
                    id: wallet._id,
                    balance: wallet.balance,
                    frozenBalance: wallet.frozenBalance,
                    availableBalance: wallet.availableBalance,
                    currency: wallet.currency,
                    status: wallet.status,
                    totalDeposit: wallet.totalDeposit,
                    totalWithdraw: wallet.totalWithdraw,
                    totalSpent: wallet.totalSpent,
                    totalRefund: wallet.totalRefund,
                    createdAt: wallet.createdAt,
                    updatedAt: wallet.updatedAt,
                },
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Deposit to wallet
 * @route   POST /wallet/deposit
 * @access  Private
 */
exports.deposit = async ( req, res, next ) => {
    try {
        const userId = req.user.id;
        const { amount, paymentMethod, paymentDetails } = req.body;

        // Validate amount
        const minDeposit = parseFloat( process.env.MIN_DEPOSIT_AMOUNT ) || 10;
        const maxDeposit = parseFloat( process.env.MAX_DEPOSIT_AMOUNT ) || 50000;

        if ( amount < minDeposit || amount > maxDeposit ) {
            return res.status( 400 ).json( {
                success: false,
                error: `Deposit amount must be between ${ minDeposit } and ${ maxDeposit }`,
            } );
        }

        // Get or create wallet
        let wallet = await Wallet.findByUser( userId );
        if ( !wallet ) {
            wallet = await Wallet.create( {
                user: userId,
                userEmail: req.user.email,
                balance: 0,
                currency: process.env.DEFAULT_CURRENCY || 'MYR',
            } );
        }

        // Check wallet status
        if ( wallet.status !== 'active' ) {
            return res.status( 403 ).json( {
                success: false,
                error: `Wallet is ${ wallet.status }. Please contact support.`,
            } );
        }

        // Create transaction
        const transactionId = Transaction.generateTransactionId();
        const transaction = await Transaction.create( {
            transactionId,
            wallet: wallet._id,
            user: userId,
            type: 'deposit',
            amount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance + amount,
            currency: wallet.currency,
            status: 'pending',
            description: `Deposit via ${ paymentMethod }`,
            paymentMethod,
            paymentDetails: paymentDetails || {},
            metadata: {
                ip: req.ip,
                userAgent: req.get( 'user-agent' ),
            },
        } );

        // Update wallet balance (for now, instant credit - in production, wait for payment confirmation)
        wallet.balance += amount;
        wallet.totalDeposit += amount;
        await wallet.save();

        // Complete transaction
        transaction.complete();
        await transaction.save();

        // Send notification
        try {
            await axios.post(
                `${ process.env.NOTIFICATION_SERVICE_URL }/notifications/send`,
                {
                    userId,
                    type: 'wallet_deposit',
                    channel: 'email',
                    data: {
                        amount,
                        currency: wallet.currency,
                        balance: wallet.balance,
                        transactionId,
                    },
                },
                {
                    headers: {
                        'X-User-ID': userId,
                        'X-User-Role': req.user.role,
                    },
                }
            );
        } catch ( notifError ) {
            console.error( 'Failed to send deposit notification:', notifError.message );
        }

        res.status( 201 ).json( {
            success: true,
            data: {
                transaction: {
                    id: transaction._id,
                    transactionId: transaction.transactionId,
                    type: transaction.type,
                    amount: transaction.amount,
                    status: transaction.status,
                    balanceAfter: transaction.balanceAfter,
                    createdAt: transaction.createdAt,
                },
                wallet: {
                    balance: wallet.balance,
                    availableBalance: wallet.availableBalance,
                },
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Deduct from wallet (called by Order Service)
 * @route   POST /wallet/deduct
 * @access  Private (Service-to-Service)
 */
exports.deduct = async ( req, res, next ) => {
    try {
        const { userId, amount, reference, description, metadata } = req.body;

        // Validate input
        if ( !userId || !amount || amount <= 0 ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Invalid deduction request',
            } );
        }

        // Get wallet
        const wallet = await Wallet.findByUser( userId );
        if ( !wallet ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Wallet not found',
            } );
        }

        // Check wallet status
        if ( wallet.status !== 'active' ) {
            return res.status( 403 ).json( {
                success: false,
                error: `Wallet is ${ wallet.status }`,
            } );
        }

        // Check sufficient balance
        if ( !wallet.canDeduct( amount ) ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Insufficient balance',
                data: {
                    required: amount,
                    available: wallet.availableBalance,
                },
            } );
        }

        // Create transaction
        const transactionId = Transaction.generateTransactionId();
        const transaction = await Transaction.create( {
            transactionId,
            wallet: wallet._id,
            user: userId,
            type: 'deduct',
            amount: -amount, // Negative for deduction
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance - amount,
            currency: wallet.currency,
            status: 'completed',
            description: description || 'Purchase',
            reference: reference || {},
            metadata: metadata || {},
        } );

        // Update wallet
        wallet.balance -= amount;
        wallet.totalSpent += amount;
        await wallet.save();

        res.json( {
            success: true,
            data: {
                transaction: {
                    id: transaction._id,
                    transactionId: transaction.transactionId,
                    amount: Math.abs( transaction.amount ),
                    status: transaction.status,
                    balanceAfter: transaction.balanceAfter,
                },
                wallet: {
                    balance: wallet.balance,
                    availableBalance: wallet.availableBalance,
                },
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Refund to wallet (called by Order Service)
 * @route   POST /wallet/refund
 * @access  Private (Service-to-Service)
 */
exports.refund = async ( req, res, next ) => {
    try {
        const { userId, amount, reference, description, metadata } = req.body;

        // Validate input
        if ( !userId || !amount || amount <= 0 ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Invalid refund request',
            } );
        }

        // Get wallet
        const wallet = await Wallet.findByUser( userId );
        if ( !wallet ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Wallet not found',
            } );
        }

        // Create transaction
        const transactionId = Transaction.generateTransactionId();
        const transaction = await Transaction.create( {
            transactionId,
            wallet: wallet._id,
            user: userId,
            type: 'refund',
            amount,
            balanceBefore: wallet.balance,
            balanceAfter: wallet.balance + amount,
            currency: wallet.currency,
            status: 'completed',
            description: description || 'Order refund',
            reference: reference || {},
            metadata: metadata || {},
        } );

        // Update wallet
        wallet.balance += amount;
        wallet.totalRefund += amount;
        await wallet.save();

        // Send notification
        try {
            await axios.post(
                `${ process.env.NOTIFICATION_SERVICE_URL }/notifications/send`,
                {
                    userId,
                    type: 'wallet_refund',
                    channel: 'email',
                    data: {
                        amount,
                        currency: wallet.currency,
                        balance: wallet.balance,
                        transactionId,
                        reason: description,
                    },
                },
                {
                    headers: {
                        'X-User-ID': userId,
                    },
                }
            );
        } catch ( notifError ) {
            console.error( 'Failed to send refund notification:', notifError.message );
        }

        res.json( {
            success: true,
            data: {
                transaction: {
                    id: transaction._id,
                    transactionId: transaction.transactionId,
                    amount: transaction.amount,
                    status: transaction.status,
                    balanceAfter: transaction.balanceAfter,
                },
                wallet: {
                    balance: wallet.balance,
                    availableBalance: wallet.availableBalance,
                },
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Get transaction history
 * @route   GET /wallet/transactions
 * @access  Private
 */
exports.getTransactions = async ( req, res, next ) => {
    try {
        const userId = req.user.id;
        const {
            type,
            status,
            startDate,
            endDate,
            page = 1,
            limit = 20,
        } = req.query;

        // Build query
        const query = { user: userId };

        if ( type ) {
            query.type = type;
        }

        if ( status ) {
            query.status = status;
        }

        if ( startDate || endDate ) {
            query.createdAt = {};
            if ( startDate ) {
                query.createdAt.$gte = new Date( startDate );
            }
            if ( endDate ) {
                query.createdAt.$lte = new Date( endDate );
            }
        }

        // Execute query with pagination
        const skip = ( page - 1 ) * limit;
        const [ transactions, total ] = await Promise.all( [
            Transaction.find( query )
                .sort( { createdAt: -1 } )
                .skip( skip )
                .limit( parseInt( limit ) )
                .lean(),
            Transaction.countDocuments( query ),
        ] );

        res.json( {
            success: true,
            data: {
                transactions: transactions.map( ( t ) => ( {
                    id: t._id,
                    transactionId: t.transactionId,
                    type: t.type,
                    amount: t.amount,
                    balanceBefore: t.balanceBefore,
                    balanceAfter: t.balanceAfter,
                    status: t.status,
                    description: t.description,
                    reference: t.reference,
                    createdAt: t.createdAt,
                } ) ),
                pagination: {
                    page: parseInt( page ),
                    limit: parseInt( limit ),
                    total,
                    pages: Math.ceil( total / limit ),
                },
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Get transaction by ID
 * @route   GET /wallet/transactions/:id
 * @access  Private
 */
exports.getTransaction = async ( req, res, next ) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const transaction = await Transaction.findOne( {
            _id: id,
            user: userId,
        } ).lean();

        if ( !transaction ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Transaction not found',
            } );
        }

        res.json( {
            success: true,
            data: {
                transaction,
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Freeze wallet (Admin only)
 * @route   POST /wallet/:userId/freeze
 * @access  Private (Admin)
 */
exports.freezeWallet = async ( req, res, next ) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        const wallet = await Wallet.findByUser( userId );
        if ( !wallet ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Wallet not found',
            } );
        }

        if ( wallet.status === 'frozen' ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Wallet is already frozen',
            } );
        }

        wallet.freeze( reason );
        await wallet.save();

        res.json( {
            success: true,
            message: 'Wallet frozen successfully',
            data: {
                wallet: {
                    id: wallet._id,
                    status: wallet.status,
                    frozenReason: wallet.frozenReason,
                    frozenAt: wallet.frozenAt,
                },
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Unfreeze wallet (Admin only)
 * @route   POST /wallet/:userId/unfreeze
 * @access  Private (Admin)
 */
exports.unfreezeWallet = async ( req, res, next ) => {
    try {
        const { userId } = req.params;

        const wallet = await Wallet.findByUser( userId );
        if ( !wallet ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Wallet not found',
            } );
        }

        if ( wallet.status !== 'frozen' ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Wallet is not frozen',
            } );
        }

        wallet.unfreeze();
        await wallet.save();

        res.json( {
            success: true,
            message: 'Wallet unfrozen successfully',
            data: {
                wallet: {
                    id: wallet._id,
                    status: wallet.status,
                },
            },
        } );
    } catch ( error ) {
        next( error );
    }
};

/**
 * @desc    Get wallet statistics (Admin only)
 * @route   GET /wallet/admin/stats
 * @access  Private (Admin)
 */
exports.getWalletStats = async ( req, res, next ) => {
    try {
        const { startDate, endDate } = req.query;

        // Build date filter
        const dateFilter = {};
        if ( startDate || endDate ) {
            dateFilter.createdAt = {};
            if ( startDate ) {
                dateFilter.createdAt.$gte = new Date( startDate );
            }
            if ( endDate ) {
                dateFilter.createdAt.$lte = new Date( endDate );
            }
        }

        // Get statistics
        const [
            totalWallets,
            activeWallets,
            frozenWallets,
            totalBalance,
            transactionStats,
        ] = await Promise.all( [
            Wallet.countDocuments(),
            Wallet.countDocuments( { status: 'active' } ),
            Wallet.countDocuments( { status: 'frozen' } ),
            Wallet.aggregate( [
                { $match: { status: 'active' } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$balance' },
                        totalFrozen: { $sum: '$frozenBalance' },
                    },
                },
            ] ),
            Transaction.aggregate( [
                { $match: { status: 'completed', ...dateFilter } },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        total: { $sum: '$amount' },
                    },
                },
            ] ),
        ] );

        // Format transaction stats
        const transactionsByType = {};
        transactionStats.forEach( ( stat ) => {
            transactionsByType[ stat._id ] = {
                count: stat.count,
                total: Math.abs( stat.total ),
            };
        } );

        res.json( {
            success: true,
            data: {
                wallets: {
                    total: totalWallets,
                    active: activeWallets,
                    frozen: frozenWallets,
                    closed: totalWallets - activeWallets - frozenWallets,
                },
                balance: {
                    total: totalBalance[ 0 ]?.total || 0,
                    frozen: totalBalance[ 0 ]?.totalFrozen || 0,
                    available: ( totalBalance[ 0 ]?.total || 0 ) - ( totalBalance[ 0 ]?.totalFrozen || 0 ),
                },
                transactions: transactionsByType,
            },
        } );
    } catch ( error ) {
        next( error );
    }
};
