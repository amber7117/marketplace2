const Notification = require( '../models/Notification' );
const NotificationPreference = require( '../models/NotificationPreference' );
const NotificationTemplate = require( '../models/NotificationTemplate' );
const emailProvider = require( '../providers/emailProvider' );
const telegramProvider = require( '../providers/telegramProvider' );

/**
 * @desc    Create and send notification
 * @route   POST /api/notifications
 * @access  Private
 */
exports.createNotification = async ( req, res ) => {
    try {
        const {
            userId,
            type,
            channel,
            subject,
            content,
            template,
            metadata,
            priority,
            scheduledAt,
        } = req.body;

        // Get user preferences
        const preferences = await NotificationPreference.findOne( { userId } );

        if ( !preferences ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'User notification preferences not found',
            } );
        }

        // Check if user wants this type of notification
        if ( !preferences.shouldNotify( type ) ) {
            return res.json( {
                success: true,
                message: 'Notification disabled by user preferences',
                sent: false,
            } );
        }

        // Determine channel based on preferences
        const userChannel = preferences.getChannel( type );
        const finalChannel = channel || userChannel;

        // Prepare recipient info
        const recipient = {
            email: preferences.email.address,
            telegramChatId: preferences.telegram.chatId,
            name: preferences.userId,
        };

        // Create notification record
        const notification = new Notification( {
            userId,
            type,
            channel: finalChannel,
            priority: priority || 'normal',
            recipient,
            subject,
            content,
            template,
            metadata,
            scheduledAt: scheduledAt || new Date(),
            status: 'pending',
        } );

        await notification.save();

        // Send immediately if not scheduled for later
        if ( !scheduledAt || new Date( scheduledAt ) <= new Date() ) {
            await sendNotification( notification, preferences );
        }

        res.status( 201 ).json( {
            success: true,
            data: notification,
        } );
    } catch ( error ) {
        console.error( 'Create notification error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to create notification',
            details: error.message,
        } );
    }
};

/**
 * Helper function to send notification
 */
async function sendNotification( notification, preferences ) {
    notification.delivery = notification.delivery || { email: {}, telegram: {} };
    const { channel } = notification;

    try {
        const shouldSendEmail = canSendEmail( channel, preferences );
        const shouldSendTelegram = canSendTelegram( channel, preferences );

        if ( shouldSendEmail ) {
            await deliverEmailNotification( notification );
        }

        if ( shouldSendTelegram ) {
            await deliverTelegramNotification( notification );
        }

        updateNotificationStatus( notification, channel );
        await notification.save();
    } catch ( error ) {
        console.error( 'Send notification error:', error );
        notification.status = 'failed';
        notification.failedAt = new Date();
        await notification.save();
    }
}

function canSendEmail( channel, preferences ) {
    return ( channel === 'email' || channel === 'both' ) && preferences.canSendEmail();
}

function canSendTelegram( channel, preferences ) {
    return ( channel === 'telegram' || channel === 'both' ) && preferences.canSendTelegram();
}

async function deliverEmailNotification( notification ) {
    const emailResult = await emailProvider.sendEmail( {
        to: notification.recipient.email,
        subject: notification.subject,
        text: notification.content.text,
        html: notification.content.html,
    } );

    if ( emailResult.success ) {
        notification.delivery.email.sent = true;
        notification.delivery.email.sentAt = new Date();
        notification.delivery.email.messageId = emailResult.messageId;
    } else {
        notification.delivery.email.error = emailResult.error;
    }
}

async function deliverTelegramNotification( notification ) {
    const telegramResult = await telegramProvider.sendMessage( {
        chatId: notification.recipient.telegramChatId,
        text: notification.content.text,
    } );

    if ( telegramResult.success ) {
        notification.delivery.telegram.sent = true;
        notification.delivery.telegram.sentAt = new Date();
        notification.delivery.telegram.messageId = telegramResult.messageId;
    } else {
        notification.delivery.telegram.error = telegramResult.error;
    }
}

function updateNotificationStatus( notification, channel ) {
    const allSent =
        ( channel === 'email' && notification.delivery.email.sent ) ||
        ( channel === 'telegram' && notification.delivery.telegram.sent ) ||
        ( channel === 'both' &&
            notification.delivery.email.sent &&
            notification.delivery.telegram.sent );

    if ( allSent ) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        return;
    }

    notification.status = 'failed';
    notification.failedAt = new Date();
    notification.retryCount = ( notification.retryCount || 0 ) + 1;
}

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getNotifications = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { type, status, channel, page = 1, limit = 20 } = req.query;

        const notifications = await Notification.getUserNotifications( userId, {
            type,
            status,
            channel,
            page,
            limit,
        } );

        const count = await Notification.countDocuments( {
            userId,
            ...( type && { type } ),
            ...( status && { status } ),
            ...( channel && { channel } ),
        } );

        res.json( {
            success: true,
            data: notifications,
            pagination: {
                currentPage: parseInt( page ),
                totalPages: Math.ceil( count / limit ),
                totalItems: count,
                itemsPerPage: parseInt( limit ),
            },
        } );
    } catch ( error ) {
        console.error( 'Get notifications error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch notifications',
        } );
    }
};

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:notificationId
 * @access  Private
 */
exports.getNotification = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { notificationId } = req.params;

        const notification = await Notification.findOne( {
            notificationId,
            userId,
        } );

        if ( !notification ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Notification not found',
            } );
        }

        res.json( {
            success: true,
            data: notification,
        } );
    } catch ( error ) {
        console.error( 'Get notification error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch notification',
        } );
    }
};

/**
 * @desc    Resend failed notification
 * @route   POST /api/notifications/:notificationId/resend
 * @access  Private
 */
exports.resendNotification = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { notificationId } = req.params;

        const notification = await Notification.findOne( {
            notificationId,
            userId,
        } );

        if ( !notification ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Notification not found',
            } );
        }

        if ( notification.status === 'sent' ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Notification already sent',
            } );
        }

        const preferences = await NotificationPreference.findOne( { userId } );

        if ( !preferences ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'User notification preferences not found',
            } );
        }

        // Reset notification status
        notification.status = 'pending';
        notification.retryCount = 0;
        await notification.save();

        // Send notification
        await sendNotification( notification, preferences );

        res.json( {
            success: true,
            message: 'Notification resent',
            data: notification,
        } );
    } catch ( error ) {
        console.error( 'Resend notification error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to resend notification',
        } );
    }
};

/**
 * @desc    Get notification statistics
 * @route   GET /api/notifications/stats
 * @access  Private (Admin)
 */
exports.getNotificationStats = async ( req, res ) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await Notification.getStatsByType( startDate, endDate );

        // Get count by status
        const statusStats = await Notification.aggregate( [
            {
                $match: {
                    ...( startDate && { createdAt: { $gte: new Date( startDate ) } } ),
                    ...( endDate && { createdAt: { $lte: new Date( endDate ) } } ),
                },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ] );

        res.json( {
            success: true,
            data: {
                byType: stats[ 0 ]?.byType || [],
                total: stats[ 0 ]?.total || 0,
                byStatus: statusStats,
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
 * @desc    Send test notification
 * @route   POST /api/notifications/test
 * @access  Private
 */
exports.sendTestNotification = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { channel } = req.body;

        const preferences = await NotificationPreference.findOne( { userId } );

        if ( !preferences ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'User notification preferences not found',
            } );
        }

        const results = {};

        // Test email
        if ( channel === 'email' || channel === 'both' ) {
            if ( preferences.canSendEmail() ) {
                const emailResult = await emailProvider.sendTestEmail(
                    preferences.email.address
                );
                results.email = emailResult;
            } else {
                results.email = {
                    success: false,
                    error: 'Email not configured or not verified',
                };
            }
        }

        // Test Telegram
        if ( channel === 'telegram' || channel === 'both' ) {
            if ( preferences.canSendTelegram() ) {
                const telegramResult = await telegramProvider.sendTestMessage(
                    preferences.telegram.chatId
                );
                results.telegram = telegramResult;
            } else {
                results.telegram = {
                    success: false,
                    error: 'Telegram not configured or not verified',
                };
            }
        }

        res.json( {
            success: true,
            results,
        } );
    } catch ( error ) {
        console.error( 'Send test notification error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to send test notification',
        } );
    }
};

/**
 * @desc    Process pending notifications (background job)
 * @route   POST /api/notifications/process
 * @access  Internal
 */
exports.processPendingNotifications = async ( req, res ) => {
    try {
        const batchSize = parseInt(
            process.env.NOTIFICATION_BATCH_SIZE || '10'
        );

        const pendingNotifications = await Notification.getPendingNotifications(
            batchSize
        );

        const results = [];

        for ( const notification of pendingNotifications ) {
            const preferences = await NotificationPreference.findOne( {
                userId: notification.userId,
            } );

            if ( preferences ) {
                await sendNotification( notification, preferences );
                results.push( {
                    notificationId: notification.notificationId,
                    status: notification.status,
                } );
            }
        }

        res.json( {
            success: true,
            processed: results.length,
            results,
        } );
    } catch ( error ) {
        console.error( 'Process pending notifications error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to process pending notifications',
        } );
    }
};

/**
 * @desc    Retry failed notifications
 * @route   POST /api/notifications/retry
 * @access  Internal
 */
exports.retryFailedNotifications = async ( req, res ) => {
    try {
        const batchSize = parseInt(
            process.env.NOTIFICATION_BATCH_SIZE || '10'
        );

        const failedNotifications = await Notification.getFailedNotifications(
            batchSize
        );

        const results = [];

        for ( const notification of failedNotifications ) {
            const preferences = await NotificationPreference.findOne( {
                userId: notification.userId,
            } );

            if ( preferences && notification.shouldRetry() ) {
                await sendNotification( notification, preferences );
                results.push( {
                    notificationId: notification.notificationId,
                    status: notification.status,
                    retryCount: notification.retryCount,
                } );
            }
        }

        res.json( {
            success: true,
            retried: results.length,
            results,
        } );
    } catch ( error ) {
        console.error( 'Retry failed notifications error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to retry notifications',
        } );
    }
};

module.exports.sendNotification = sendNotification;
