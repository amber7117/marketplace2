const mongoose = require( 'mongoose' );

const transactionSchema = new mongoose.Schema(
    {
        transactionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        wallet: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Wallet',
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'deposit',      // 充值
                'withdraw',     // 提现
                'deduct',       // 扣款（购买）
                'refund',       // 退款
                'transfer_in',  // 转入
                'transfer_out', // 转出
                'fee',          // 手续费
                'bonus',        // 奖励
                'adjustment',   // 调整
            ],
            index: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        balanceBefore: {
            type: Number,
            required: true,
        },
        balanceAfter: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'MYR',
        },
        status: {
            type: String,
            enum: [ 'pending', 'completed', 'failed', 'cancelled', 'reversed' ],
            default: 'pending',
            index: true,
        },
        description: {
            type: String,
        },
        reference: {
            type: {
                type: String,
                enum: [ 'order', 'payment', 'withdrawal', 'transfer', 'manual' ],
            },
            id: String,
        },
        paymentMethod: {
            type: String,
            enum: [ 'wallet', 'stripe', 'razer', 'fpx', 'usdt', 'bank_transfer', 'manual' ],
        },
        paymentDetails: {
            transactionId: String,
            gateway: String,
            status: String,
            paidAt: Date,
        },
        metadata: {
            orderId: String,
            orderNumber: String,
            productName: String,
            ip: String,
            userAgent: String,
            notes: String,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        processedAt: {
            type: Date,
        },
        failedReason: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique transaction ID
transactionSchema.statics.generateTransactionId = function () {
    const timestamp = Date.now().toString( 36 ).toUpperCase();
    const random = Math.random().toString( 36 ).substring( 2, 8 ).toUpperCase();
    return `TXN-${ timestamp }-${ random }`;
};

// Instance methods
transactionSchema.methods.complete = function () {
    this.status = 'completed';
    this.processedAt = new Date();
};

transactionSchema.methods.fail = function ( reason ) {
    this.status = 'failed';
    this.failedReason = reason;
    this.processedAt = new Date();
};

transactionSchema.methods.cancel = function () {
    this.status = 'cancelled';
    this.processedAt = new Date();
};

transactionSchema.methods.reverse = function () {
    this.status = 'reversed';
    this.processedAt = new Date();
};

// Indexes
transactionSchema.index( { wallet: 1, createdAt: -1 } );
transactionSchema.index( { user: 1, type: 1 } );
transactionSchema.index( { user: 1, status: 1 } );
transactionSchema.index( { 'reference.type': 1, 'reference.id': 1 } );
transactionSchema.index( { createdAt: -1 } );

const Transaction = mongoose.model( 'Transaction', transactionSchema );

module.exports = Transaction;
