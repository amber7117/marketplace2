const mongoose = require( 'mongoose' );

const notificationSchema = new mongoose.Schema(
    {
        notificationId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                'order_created',
                'order_paid',
                'order_delivered',
                'order_cancelled',
                'payment_completed',
                'payment_failed',
                'payment_refunded',
                'wallet_deposit',
                'wallet_withdrawal',
                'account_verification',
                'password_reset',
                'system_announcement',
                'promotional',
            ],
            index: true,
        },
        channel: {
            type: String,
            required: true,
            enum: [ 'email', 'telegram', 'both' ],
        },
        priority: {
            type: String,
            default: 'normal',
            enum: [ 'low', 'normal', 'high', 'urgent' ],
            index: true,
        },
        status: {
            type: String,
            default: 'pending',
            enum: [ 'pending', 'sent', 'failed', 'cancelled' ],
            index: true,
        },
        recipient: {
            email: {
                type: String,
                lowercase: true,
                trim: true,
            },
            telegramChatId: {
                type: String,
            },
            name: {
                type: String,
            },
        },
        subject: {
            type: String,
            required: true,
        },
        content: {
            text: {
                type: String,
                required: true,
            },
            html: {
                type: String,
            },
        },
        template: {
            name: {
                type: String,
            },
            data: {
                type: mongoose.Schema.Types.Mixed,
            },
        },
        metadata: {
            referenceId: {
                type: String,
                index: true,
            },
            referenceType: {
                type: String,
                enum: [ 'order', 'payment', 'transaction', 'user', 'system' ],
            },
            additionalData: {
                type: mongoose.Schema.Types.Mixed,
            },
        },
        delivery: {
            email: {
                sent: { type: Boolean, default: false },
                sentAt: { type: Date },
                error: { type: String },
                messageId: { type: String },
            },
            telegram: {
                sent: { type: Boolean, default: false },
                sentAt: { type: Date },
                error: { type: String },
                messageId: { type: Number },
            },
        },
        retryCount: {
            type: Number,
            default: 0,
        },
        scheduledAt: {
            type: Date,
            index: true,
        },
        sentAt: {
            type: Date,
            index: true,
        },
        failedAt: {
            type: Date,
        },
        expiresAt: {
            type: Date,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for querying
notificationSchema.index( { userId: 1, createdAt: -1 } );
notificationSchema.index( { status: 1, priority: -1 } );

// TTL index for auto-delete old notifications (90 days)
notificationSchema.index( { createdAt: 1 }, { expireAfterSeconds: 7776000 } );

// Generate unique notification ID
notificationSchema.pre( 'save', function ( next ) {
    if ( !this.notificationId ) {
        const timestamp = Date.now().toString( 36 );
        const random = Math.random().toString( 36 ).substring( 2, 9 );
        this.notificationId = `NOTIF-${ timestamp }-${ random }`.toUpperCase();
    }
    next();
} );

// Instance methods
notificationSchema.methods.markAsSent = function ( channel ) {
    this.status = 'sent';
    this.sentAt = new Date();

    if ( channel === 'email' ) {
        this.delivery.email.sent = true;
        this.delivery.email.sentAt = new Date();
    } else if ( channel === 'telegram' ) {
        this.delivery.telegram.sent = true;
        this.delivery.telegram.sentAt = new Date();
    }

    return this.save();
};

notificationSchema.methods.markAsFailed = function ( channel, error ) {
    this.status = 'failed';
    this.failedAt = new Date();
    this.retryCount += 1;

    if ( channel === 'email' ) {
        this.delivery.email.error = error;
    } else if ( channel === 'telegram' ) {
        this.delivery.telegram.error = error;
    }

    return this.save();
};

notificationSchema.methods.shouldRetry = function () {
    const maxRetries = parseInt( process.env.MAX_RETRY_ATTEMPTS || '3' );
    return this.status === 'failed' && this.retryCount < maxRetries;
};

notificationSchema.methods.isExpired = function () {
    if ( !this.expiresAt ) return false;
    return new Date() > this.expiresAt;
};

// Static methods
notificationSchema.statics.getPendingNotifications = function ( limit = 10 ) {
    return this.find( {
        status: 'pending',
        $or: [
            { scheduledAt: { $lte: new Date() } },
            { scheduledAt: { $exists: false } },
        ],
    } )
        .sort( { priority: -1, createdAt: 1 } )
        .limit( limit );
};

notificationSchema.statics.getFailedNotifications = function ( limit = 10 ) {
    const maxRetries = parseInt( process.env.MAX_RETRY_ATTEMPTS || '3' );
    return this.find( {
        status: 'failed',
        retryCount: { $lt: maxRetries },
    } )
        .sort( { retryCount: 1, failedAt: 1 } )
        .limit( limit );
};

notificationSchema.statics.getUserNotifications = function (
    userId,
    options = {}
) {
    const {
        type,
        status,
        channel,
        page = 1,
        limit = 20,
    } = options;

    const query = { userId };
    if ( type ) query.type = type;
    if ( status ) query.status = status;
    if ( channel ) query.channel = channel;

    return this.find( query )
        .sort( { createdAt: -1 } )
        .limit( limit )
        .skip( ( page - 1 ) * limit )
        .select( '-delivery -template.data' );
};

notificationSchema.statics.getStatsByType = function ( startDate, endDate ) {
    const matchStage = {};
    if ( startDate || endDate ) {
        matchStage.createdAt = {};
        if ( startDate ) matchStage.createdAt.$gte = new Date( startDate );
        if ( endDate ) matchStage.createdAt.$lte = new Date( endDate );
    }

    return this.aggregate( [
        { $match: matchStage },
        {
            $group: {
                _id: {
                    type: '$type',
                    status: '$status',
                    channel: '$channel',
                },
                count: { $sum: 1 },
            },
        },
        {
            $group: {
                _id: null,
                byType: {
                    $push: {
                        type: '$_id.type',
                        status: '$_id.status',
                        channel: '$_id.channel',
                        count: '$count',
                    },
                },
                total: { $sum: '$count' },
            },
        },
    ] );
};

const Notification = mongoose.model( 'Notification', notificationSchema );

module.exports = Notification;
