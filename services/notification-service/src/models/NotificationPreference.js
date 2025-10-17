const mongoose = require( 'mongoose' );

const notificationPreferenceSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        email: {
            enabled: {
                type: Boolean,
                default: true,
            },
            address: {
                type: String,
                lowercase: true,
                trim: true,
            },
            verified: {
                type: Boolean,
                default: false,
            },
        },
        telegram: {
            enabled: {
                type: Boolean,
                default: false,
            },
            chatId: {
                type: String,
            },
            username: {
                type: String,
            },
            verified: {
                type: Boolean,
                default: false,
            },
        },
        preferences: {
            orderNotifications: {
                type: Boolean,
                default: true,
            },
            paymentNotifications: {
                type: Boolean,
                default: true,
            },
            walletNotifications: {
                type: Boolean,
                default: true,
            },
            systemNotifications: {
                type: Boolean,
                default: true,
            },
            promotionalNotifications: {
                type: Boolean,
                default: false,
            },
        },
        channels: {
            orders: {
                type: String,
                enum: [ 'email', 'telegram', 'both', 'none' ],
                default: 'email',
            },
            payments: {
                type: String,
                enum: [ 'email', 'telegram', 'both', 'none' ],
                default: 'email',
            },
            wallet: {
                type: String,
                enum: [ 'email', 'telegram', 'both', 'none' ],
                default: 'email',
            },
            system: {
                type: String,
                enum: [ 'email', 'telegram', 'both', 'none' ],
                default: 'email',
            },
        },
        timezone: {
            type: String,
            default: 'Asia/Kuala_Lumpur',
        },
        language: {
            type: String,
            default: 'en',
            enum: [ 'en', 'zh', 'ms' ],
        },
    },
    {
        timestamps: true,
    }
);

// Instance methods
notificationPreferenceSchema.methods.shouldNotify = function ( notificationType ) {
    const typeMap = {
        order_created: 'orderNotifications',
        order_paid: 'orderNotifications',
        order_delivered: 'orderNotifications',
        order_cancelled: 'orderNotifications',
        payment_completed: 'paymentNotifications',
        payment_failed: 'paymentNotifications',
        payment_refunded: 'paymentNotifications',
        wallet_deposit: 'walletNotifications',
        wallet_withdrawal: 'walletNotifications',
        system_announcement: 'systemNotifications',
        promotional: 'promotionalNotifications',
    };

    const preferenceKey = typeMap[ notificationType ];
    return preferenceKey ? this.preferences[ preferenceKey ] : true;
};

notificationPreferenceSchema.methods.getChannel = function ( notificationType ) {
    const categoryMap = {
        order_created: 'orders',
        order_paid: 'orders',
        order_delivered: 'orders',
        order_cancelled: 'orders',
        payment_completed: 'payments',
        payment_failed: 'payments',
        payment_refunded: 'payments',
        wallet_deposit: 'wallet',
        wallet_withdrawal: 'wallet',
        system_announcement: 'system',
        promotional: 'system',
    };

    const category = categoryMap[ notificationType ] || 'system';
    return this.channels[ category ] || 'email';
};

notificationPreferenceSchema.methods.canSendEmail = function () {
    return this.email.enabled && this.email.address && this.email.verified;
};

notificationPreferenceSchema.methods.canSendTelegram = function () {
    return this.telegram.enabled && this.telegram.chatId && this.telegram.verified;
};

// Static methods
notificationPreferenceSchema.statics.getOrCreate = async function ( userId, emailAddress ) {
    let preference = await this.findOne( { userId } );

    if ( !preference ) {
        preference = await this.create( {
            userId,
            email: {
                enabled: true,
                address: emailAddress,
                verified: false,
            },
        } );
    }

    return preference;
};

notificationPreferenceSchema.statics.updateEmailAddress = function (
    userId,
    emailAddress
) {
    return this.findOneAndUpdate(
        { userId },
        {
            'email.address': emailAddress,
            'email.verified': false,
        },
        { new: true, upsert: true }
    );
};

notificationPreferenceSchema.statics.updateTelegramChatId = function (
    userId,
    chatId,
    username
) {
    return this.findOneAndUpdate(
        { userId },
        {
            'telegram.chatId': chatId,
            'telegram.username': username,
            'telegram.verified': true,
        },
        { new: true, upsert: true }
    );
};

const NotificationPreference = mongoose.model(
    'NotificationPreference',
    notificationPreferenceSchema
);

module.exports = NotificationPreference;
