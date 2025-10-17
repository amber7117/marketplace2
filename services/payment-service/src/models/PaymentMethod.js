const mongoose = require( 'mongoose' );

const paymentMethodSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        gateway: {
            type: String,
            required: true,
            enum: [ 'stripe', 'razer', 'fpx', 'usdt' ],
        },
        type: {
            type: String,
            required: true,
            enum: [ 'card', 'bank_account', 'crypto_wallet', 'ewallet' ],
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // Card details (for Stripe)
        card: {
            brand: String,
            last4: String,
            expiryMonth: String,
            expiryYear: String,
            fingerprint: String,
            funding: String,
            country: String,
        },
        // Bank account details (for FPX)
        bankAccount: {
            bankName: String,
            bankCode: String,
            accountNumber: String,
            accountHolder: String,
        },
        // Crypto wallet details (for USDT)
        cryptoWallet: {
            address: String,
            network: String,
            verified: Boolean,
        },
        // Gateway-specific data
        gatewayData: {
            customerId: String,
            paymentMethodId: String,
            setupIntentId: String,
            metadata: mongoose.Schema.Types.Mixed,
        },
        // Usage statistics
        usage: {
            lastUsedAt: Date,
            totalTransactions: {
                type: Number,
                default: 0,
            },
            totalAmount: {
                type: Number,
                default: 0,
            },
        },
        // Verification
        verified: {
            type: Boolean,
            default: false,
        },
        verifiedAt: {
            type: Date,
        },
        // Metadata
        metadata: {
            nickname: String,
            notes: String,
        },
    },
    {
        timestamps: true,
    }
);

// Instance methods
paymentMethodSchema.methods.markAsDefault = async function () {
    // Remove default from other payment methods
    await this.constructor.updateMany(
        { user: this.user, _id: { $ne: this._id } },
        { isDefault: false }
    );

    this.isDefault = true;
    await this.save();
};

paymentMethodSchema.methods.recordUsage = function ( amount ) {
    this.usage.lastUsedAt = new Date();
    this.usage.totalTransactions += 1;
    this.usage.totalAmount += amount;
};

// Static methods
paymentMethodSchema.statics.getDefaultForUser = function ( userId ) {
    return this.findOne( { user: userId, isDefault: true, isActive: true } );
};

paymentMethodSchema.statics.getUserMethods = function ( userId, gateway = null ) {
    const query = { user: userId, isActive: true };
    if ( gateway ) {
        query.gateway = gateway;
    }
    return this.find( query ).sort( { isDefault: -1, createdAt: -1 } );
};

// Indexes
paymentMethodSchema.index( { user: 1, gateway: 1 } );
paymentMethodSchema.index( { user: 1, isDefault: 1 } );
paymentMethodSchema.index( { 'gatewayData.customerId': 1 } );

const PaymentMethod = mongoose.model( 'PaymentMethod', paymentMethodSchema );

module.exports = PaymentMethod;
