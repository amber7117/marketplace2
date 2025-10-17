const express = require( 'express' );
const router = express.Router();
const {
    createNotification,
    getNotifications,
    getNotification,
    resendNotification,
    getNotificationStats,
    sendTestNotification,
    processPendingNotifications,
    retryFailedNotifications,
} = require( '../controllers/notificationController' );
const { body } = require( 'express-validator' );
const { validate } = require( '../middleware/validator' );
const authMiddleware = require( '../middleware/auth' );

// Protected routes
router.use( authMiddleware );

// Get user notifications
router.get( '/', getNotifications );

// Get notification stats (admin)
router.get( '/stats', getNotificationStats );

// Send test notification
router.post(
    '/test',
    [
        body( 'channel' )
            .isIn( [ 'email', 'telegram', 'both' ] )
            .withMessage( 'Invalid channel' ),
        validate,
    ],
    sendTestNotification
);

// Process pending notifications (internal/cron)
router.post( '/process', processPendingNotifications );

// Retry failed notifications (internal/cron)
router.post( '/retry', retryFailedNotifications );

// Create notification
router.post(
    '/',
    [
        body( 'userId' ).isString().notEmpty().withMessage( 'User ID is required' ),
        body( 'type' ).isString().notEmpty().withMessage( 'Type is required' ),
        body( 'subject' ).isString().notEmpty().withMessage( 'Subject is required' ),
        body( 'content.text' )
            .isString()
            .notEmpty()
            .withMessage( 'Content text is required' ),
        validate,
    ],
    createNotification
);

// Get single notification
router.get( '/:notificationId', getNotification );

// Resend notification
router.post( '/:notificationId/resend', resendNotification );

module.exports = router;
