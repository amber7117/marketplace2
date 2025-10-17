const NotificationPreference = require( '../models/NotificationPreference' );

/**
 * @desc    Get user notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
exports.getPreferences = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];

        let preferences = await NotificationPreference.findOne( { userId } );

        if ( !preferences ) {
            // Create default preferences if not exists
            preferences = await NotificationPreference.create( {
                userId,
                email: {
                    enabled: true,
                    address: req.body.email || '',
                    verified: false,
                },
            } );
        }

        res.json( {
            success: true,
            data: preferences,
        } );
    } catch ( error ) {
        console.error( 'Get preferences error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch preferences',
        } );
    }
};

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
exports.updatePreferences = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const updates = req.body;

        let preferences = await NotificationPreference.findOne( { userId } );

        if ( !preferences ) {
            preferences = new NotificationPreference( {
                userId,
                ...updates,
            } );
        } else {
            Object.assign( preferences, updates );
        }

        await preferences.save();

        res.json( {
            success: true,
            data: preferences,
            message: 'Preferences updated successfully',
        } );
    } catch ( error ) {
        console.error( 'Update preferences error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to update preferences',
        } );
    }
};

/**
 * @desc    Update email address
 * @route   PUT /api/notifications/preferences/email
 * @access  Private
 */
exports.updateEmail = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { email } = req.body;

        if ( !email ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Email address is required',
            } );
        }

        const preferences = await NotificationPreference.updateEmailAddress(
            userId,
            email
        );

        res.json( {
            success: true,
            data: preferences,
            message: 'Email address updated. Please verify your email.',
        } );
    } catch ( error ) {
        console.error( 'Update email error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to update email address',
        } );
    }
};

/**
 * @desc    Link Telegram account
 * @route   PUT /api/notifications/preferences/telegram
 * @access  Private
 */
exports.linkTelegram = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { chatId, username } = req.body;

        if ( !chatId ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Telegram chat ID is required',
            } );
        }

        const preferences = await NotificationPreference.updateTelegramChatId(
            userId,
            chatId,
            username
        );

        res.json( {
            success: true,
            data: preferences,
            message: 'Telegram account linked successfully',
        } );
    } catch ( error ) {
        console.error( 'Link Telegram error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to link Telegram account',
        } );
    }
};

/**
 * @desc    Enable/disable notification type
 * @route   PUT /api/notifications/preferences/:type
 * @access  Private
 */
exports.toggleNotificationType = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { type } = req.params;
        const { enabled } = req.body;

        const preferences = await NotificationPreference.findOne( { userId } );

        if ( !preferences ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Preferences not found',
            } );
        }

        // Map type to preference field
        const typeMap = {
            orders: 'orderNotifications',
            payments: 'paymentNotifications',
            wallet: 'walletNotifications',
            system: 'systemNotifications',
            promotional: 'promotionalNotifications',
        };

        const preferenceField = typeMap[ type ];

        if ( !preferenceField ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Invalid notification type',
            } );
        }

        preferences.preferences[ preferenceField ] = enabled;
        await preferences.save();

        res.json( {
            success: true,
            data: preferences,
            message: `${ type } notifications ${ enabled ? 'enabled' : 'disabled' }`,
        } );
    } catch ( error ) {
        console.error( 'Toggle notification type error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to update notification type',
        } );
    }
};

/**
 * @desc    Set preferred channel for notification category
 * @route   PUT /api/notifications/preferences/channel/:category
 * @access  Private
 */
exports.setPreferredChannel = async ( req, res ) => {
    try {
        const userId = req.headers[ 'x-user-id' ];
        const { category } = req.params;
        const { channel } = req.body;

        const validCategories = [ 'orders', 'payments', 'wallet', 'system' ];
        const validChannels = [ 'email', 'telegram', 'both', 'none' ];

        if ( !validCategories.includes( category ) ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Invalid category',
            } );
        }

        if ( !validChannels.includes( channel ) ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Invalid channel',
            } );
        }

        const preferences = await NotificationPreference.findOne( { userId } );

        if ( !preferences ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Preferences not found',
            } );
        }

        preferences.channels[ category ] = channel;
        await preferences.save();

        res.json( {
            success: true,
            data: preferences,
            message: `Preferred channel for ${ category } set to ${ channel }`,
        } );
    } catch ( error ) {
        console.error( 'Set preferred channel error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to set preferred channel',
        } );
    }
};
