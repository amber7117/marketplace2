const mongoose = require( 'mongoose' );

const orderSchema = new mongoose.Schema( {
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    userEmail: {
        type: String,
        required: true
    },
    items: [ {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        productType: {
            type: String,
            enum: [ 'digital', 'gift_card', 'game_credit', 'subscription', 'dlc' ],
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        deliveryCode: {
            type: String
        },
        deliveryInstructions: {
            type: String
        }
    } ],
    status: {
        type: String,
        enum: [ 'pending', 'paid', 'delivering', 'delivered', 'completed', 'cancelled', 'refunded' ],
        default: 'pending',
        index: true
    },
    payment: {
        method: {
            type: String,
            enum: [ 'wallet', 'stripe', 'razer', 'fpx', 'usdt' ],
            required: true
        },
        transactionId: {
            type: String
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD',
            enum: [ 'USD', 'MYR', 'THB', 'VND', 'PHP', 'SGD' ]
        },
        status: {
            type: String,
            enum: [ 'pending', 'completed', 'failed', 'refunded' ],
            default: 'pending'
        },
        paidAt: {
            type: Date
        }
    },
    delivery: {
        method: {
            type: String,
            enum: [ 'instant', 'manual', 'api' ],
            default: 'instant'
        },
        status: {
            type: String,
            enum: [ 'pending', 'processing', 'delivered', 'failed' ],
            default: 'pending'
        },
        deliveredAt: {
            type: Date
        },
        codes: [ {
            type: String
        } ],
        notes: {
            type: String
        }
    },
    totals: {
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        tax: {
            type: Number,
            default: 0,
            min: 0
        },
        discount: {
            type: Number,
            default: 0,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    customerInfo: {
        ipAddress: String,
        userAgent: String,
        country: String
    },
    notes: {
        type: String
    },
    expiresAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    },
    cancellationReason: {
        type: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
} );

// Generate unique order number
orderSchema.pre( 'save', async function ( next ) {
    if ( this.isNew ) {
        const prefix = process.env.ORDER_NUMBER_PREFIX || 'VTP';
        const timestamp = Date.now().toString( 36 ).toUpperCase();
        const random = Math.random().toString( 36 ).substring( 2, 6 ).toUpperCase();
        this.orderNumber = `${ prefix }-${ timestamp }-${ random }`;

        // Set expiry time for pending orders
        if ( !this.expiresAt ) {
            const expiryMinutes = parseInt( process.env.ORDER_EXPIRY_MINUTES ) || 30;
            this.expiresAt = new Date( Date.now() + expiryMinutes * 60 * 1000 );
        }
    }
    next();
} );

// Calculate totals before saving
orderSchema.pre( 'save', function ( next ) {
    if ( this.isModified( 'items' ) ) {
        this.totals.subtotal = this.items.reduce( ( sum, item ) => sum + item.totalPrice, 0 );
        this.totals.total = this.totals.subtotal + this.totals.tax - this.totals.discount;
    }
    next();
} );

// Indexes for better query performance
orderSchema.index( { orderNumber: 1 } );
orderSchema.index( { user: 1, status: 1 } );
orderSchema.index( { status: 1, createdAt: -1 } );
orderSchema.index( { 'payment.status': 1 } );
orderSchema.index( { expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: 'pending' } } );

module.exports = mongoose.model( 'Order', orderSchema );
