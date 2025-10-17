const express = require( 'express' );
const router = express.Router();
const {
    getPreferences,
    updatePreferences,
    updateEmail,
    linkTelegram,
    toggleNotificationType,
    setPreferredChannel,
} = require( '../controllers/preferenceController' );
const { body } = require( 'express-validator' );
const { validate } = require( '../middleware/validator' );
const authMiddleware = require( '../middleware/auth' );

// All routes require authentication
router.use( authMiddleware );

// Get preferences
router.get( '/', getPreferences );

// Update preferences
router.put( '/', updatePreferences );

// Update email address
router.put(
    '/email',
    [
        body( 'email' ).isEmail().withMessage( 'Valid email is required' ),
        validate,
    ],
    updateEmail
);

// Link Telegram account
router.put(
    '/telegram',
    [
        body( 'chatId' ).isString().notEmpty().withMessage( 'Chat ID is required' ),
        validate,
    ],
    linkTelegram
);

// Toggle notification type
router.put(
    '/:type',
    [
        body( 'enabled' ).isBoolean().withMessage( 'Enabled must be boolean' ),
        validate,
    ],
    toggleNotificationType
);

// Set preferred channel
router.put(
    '/channel/:category',
    [
        body( 'channel' )
            .isIn( [ 'email', 'telegram', 'both', 'none' ] )
            .withMessage( 'Invalid channel' ),
        validate,
    ],
    setPreferredChannel
);

module.exports = router;
