const mongoose = require( 'mongoose' );

const paymentSchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: [ 'topup', 'order', 'withdrawal' ],
            index: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            default: 'MYR',
            enum: [ 'MYR', 'USD', 'SGD', 'THB', 'IDR', 'VND' ],
        },
        gateway: {
            type: String,
            required: true,
            enum: [ 'stripe', 'razer', 'fpx', 'usdt', 'manual' ],
            index: true,
        },
        status: {
            type: String,
            required: true,
            enum: [ 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded' ],
            default: 'pending',
            index: true,
        },
        gatewayResponse: {
            transactionId: String,
            paymentIntentId: String,
            chargeId: String,
            receiptUrl: String,
            status: String,
            errorCode: String,
            errorMessage: String,
            rawResponse: mongoose.Schema.Types.Mixed,
        },
        paymentMethod: {
            type: String,
            brand: String,
            last4: String,
            expiryMonth: String,
            expiryYear: String,
            bankName: String,
            walletAddress: String,
        },
        reference: {
            type: {
                type: String,
                enum: [ 'order', 'wallet', 'withdrawal', 'manual' ],
            },
            id: String,
            orderNumber: String,
        },
        metadata: {
            ip: String,
            userAgent: String,
            country: String,
            notes: String,
            webhookReceived: Boolean,
            webhookVerified: Boolean,
            callbackUrl: String,
            returnUrl: String,
        },
        timeline: [
            {
                status: String,
                timestamp: {
                    type: Date,
                    default: Date.now,
                },
                message: String,
                by: String,
            },
        ],
        fee: {
            amount: Number,
            currency: String,
            percentage: Number,
        },
        netAmount: {
            type: Number,
        },
        refundedAmount: {
            type: Number,
            default: 0,
        },
        refundedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
            index: true,
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Generate unique payment ID
paymentSchema.statics.generatePaymentId = function () {
    const timestamp = Date.now().toString( 36 ).toUpperCase();
    const random = Math.random().toString( 36 ).substring( 2, 8 ).toUpperCase();
    return `PAY-${ timestamp }-${ random }`;
};

// Add timeline entry
paymentSchema.methods.addTimeline = function ( status, message, by = 'system' ) {
    this.timeline.push( {
        status,
        timestamp: new Date(),
        message,
        by,
    } );
};

// Update status with timeline
paymentSchema.methods.updateStatus = function ( newStatus, message, by = 'system' ) {
    this.status = newStatus;
    this.addTimeline( newStatus, message, by );

    if ( newStatus === 'completed' ) {
        this.completedAt = new Date();
    }
};

// Mark as completed
paymentSchema.methods.markCompleted = function ( gatewayResponse ) {
    this.status = 'completed';
    this.completedAt = new Date();
    this.gatewayResponse = {
        ...this.gatewayResponse,
        ...gatewayResponse,
    };
    this.addTimeline( 'completed', 'Payment completed successfully' );
};

// Mark as failed
paymentSchema.methods.markFailed = function ( errorCode, errorMessage ) {
    this.status = 'failed';
    this.gatewayResponse = {
        ...this.gatewayResponse,
        errorCode,
        errorMessage,
    };
    this.addTimeline( 'failed', `Payment failed: ${ errorMessage }` );
};

// Calculate net amount (after fees)
paymentSchema.methods.calculateNetAmount = function () {
    if ( this.fee?.amount ) {
        this.netAmount = this.amount - this.fee.amount;
    } else {
        this.netAmount = this.amount;
    }
};

// Check if expired
paymentSchema.methods.isExpired = function () {
    return this.expiresAt && new Date() > this.expiresAt;
};

// Static method to find pending payments
paymentSchema.statics.findPending = function ( userId ) {
    return this.find( {
        user: userId,
        status: 'pending',
        expiresAt: { $gt: new Date() }
    } );
};

// Indexes
paymentSchema.index( { user: 1, status: 1 } );
paymentSchema.index( { gateway: 1, status: 1 } );
paymentSchema.index( { createdAt: -1 } );
paymentSchema.index( { 'reference.type': 1, 'reference.id': 1 } );
paymentSchema.index( { 'gatewayResponse.transactionId': 1 } );

// TTL index for expired pending payments (auto-delete after 24 hours)
paymentSchema.index( { expiresAt: 1 }, { expireAfterSeconds: 86400 } );

const Payment = mongoose.model( 'Payment', paymentSchema );

module.exports = Payment;
