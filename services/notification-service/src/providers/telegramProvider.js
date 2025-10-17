const TelegramBot = require( 'node-telegram-bot-api' );

class TelegramProvider {
    constructor() {
        this.bot = null;
        this.isConfigured = false;
        this.adminChatId = null;
    }

    /**
     * Initialize Telegram bot
     */
    init() {
        try {
            const token = process.env.TELEGRAM_BOT_TOKEN;
            this.adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

            if ( !token ) {
                console.warn( '⚠️  Telegram bot not configured' );
                return;
            }

            this.bot = new TelegramBot( token, { polling: false } );
            this.isConfigured = true;

            console.log( '✅ Telegram provider configured' );

            // Set up bot commands
            this.setupCommands();
        } catch ( error ) {
            console.error( '❌ Telegram provider initialization failed:', error.message );
            this.isConfigured = false;
        }
    }

    /**
     * Set up bot commands
     */
    setupCommands() {
        if ( !this.isConfigured ) return;

        this.bot.setMyCommands( [
            { command: 'start', description: 'Start bot and get chat ID' },
            { command: 'notify', description: 'Enable notifications' },
            { command: 'stop', description: 'Disable notifications' },
            { command: 'status', description: 'Check notification status' },
            { command: 'help', description: 'Show help message' },
        ] );
    }

    /**
     * Enable polling for bot commands
     */
    enablePolling() {
        if ( !this.isConfigured || !this.bot ) return;

        this.bot.startPolling();
        this.setupMessageHandlers();
        console.log( '🤖 Telegram bot polling enabled' );
    }

    /**
     * Set up message handlers
     */
    setupMessageHandlers() {
        // Handle /start command
        this.bot.onText( /\/start/, async ( msg ) => {
            const chatId = msg.chat.id;
            const username = msg.from.username || msg.from.first_name;

            await this.bot.sendMessage(
                chatId,
                `Welcome ${ username }! 👋\n\n` +
                `Your Chat ID: \`${ chatId }\`\n\n` +
                `To receive notifications:\n` +
                `1. Copy your Chat ID\n` +
                `2. Add it to your profile settings\n` +
                `3. Use /notify to enable notifications\n\n` +
                `Type /help for more commands.`,
                { parse_mode: 'Markdown' }
            );
        } );

        // Handle /help command
        this.bot.onText( /\/help/, async ( msg ) => {
            const chatId = msg.chat.id;

            await this.bot.sendMessage(
                chatId,
                `*Available Commands:*\n\n` +
                `/start - Get your Chat ID\n` +
                `/notify - Enable notifications\n` +
                `/stop - Disable notifications\n` +
                `/status - Check notification status\n` +
                `/help - Show this message`,
                { parse_mode: 'Markdown' }
            );
        } );

        // Handle /status command
        this.bot.onText( /\/status/, async ( msg ) => {
            const chatId = msg.chat.id;

            await this.bot.sendMessage(
                chatId,
                `*Notification Status*\n\n` +
                `Chat ID: \`${ chatId }\`\n` +
                `Status: Connected ✅\n\n` +
                `You will receive notifications for:\n` +
                `• Orders\n` +
                `• Payments\n` +
                `• Wallet transactions\n` +
                `• System announcements`,
                { parse_mode: 'Markdown' }
            );
        } );
    }

    /**
     * Send Telegram message
     */
    async sendMessage( { chatId, text, parseMode = 'Markdown', buttons = [] } ) {
        if ( !this.isConfigured || !this.bot ) {
            return {
                success: false,
                error: 'Telegram bot not configured',
            };
        }

        try {
            const options = {
                parse_mode: parseMode,
            };

            if ( buttons.length > 0 ) {
                options.reply_markup = {
                    inline_keyboard: buttons,
                };
            }

            const message = await this.bot.sendMessage( chatId, text, options );

            return {
                success: true,
                messageId: message.message_id,
            };
        } catch ( error ) {
            console.error( 'Telegram send error:', error );
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Send notification with template
     */
    async sendNotification( { chatId, type, data } ) {
        const template = this.getTemplate( type );

        if ( !template ) {
            return {
                success: false,
                error: `Template ${ type } not found`,
            };
        }

        // Replace variables in template
        let text = template.text;
        Object.keys( data ).forEach( ( key ) => {
            text = text.replace( new RegExp( `{{${ key }}}`, 'g' ), data[ key ] );
        } );

        return this.sendMessage( {
            chatId,
            text,
            parseMode: template.parseMode,
            buttons: template.buttons || [],
        } );
    }

    /**
     * Get message template
     */
    getTemplate( type ) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        const templates = {
            order_created: {
                text: `🛒 *Order Confirmation*\n\n` +
                    `Order ID: \`{{orderId}}\`\n` +
                    `Total: {{currency}} {{amount}}\n` +
                    `Status: {{status}}\n\n` +
                    `Thank you for your order!`,
                parseMode: 'Markdown',
                buttons: [
                    [ { text: 'View Order', url: `${ frontendUrl }/orders/{{orderId}}` } ],
                ],
            },
            order_paid: {
                text: `✅ *Payment Received*\n\n` +
                    `Your order *{{orderId}}* has been paid!\n\n` +
                    `Amount: {{currency}} {{amount}}\n` +
                    `Your order will be processed shortly.`,
                parseMode: 'Markdown',
                buttons: [
                    [ { text: 'View Order', url: `${ frontendUrl }/orders/{{orderId}}` } ],
                ],
            },
            order_delivered: {
                text: `📦 *Order Delivered*\n\n` +
                    `Order ID: \`{{orderId}}\`\n` +
                    `Product: {{productName}}\n\n` +
                    `{{deliveryInfo}}`,
                parseMode: 'Markdown',
                buttons: [
                    [ { text: 'View Details', url: `${ frontendUrl }/orders/{{orderId}}` } ],
                ],
            },
            payment_completed: {
                text: `💳 *Payment Successful*\n\n` +
                    `Payment ID: \`{{paymentId}}\`\n` +
                    `Amount: {{currency}} {{amount}}\n` +
                    `Date: {{date}}\n\n` +
                    `Your payment has been processed successfully!`,
                parseMode: 'Markdown',
                buttons: [
                    [ { text: 'View Receipt', url: `${ frontendUrl }/payments/{{paymentId}}` } ],
                ],
            },
            payment_failed: {
                text: `❌ *Payment Failed*\n\n` +
                    `Payment ID: \`{{paymentId}}\`\n` +
                    `Amount: {{currency}} {{amount}}\n\n` +
                    `Reason: {{reason}}\n\n` +
                    `Please try again or contact support.`,
                parseMode: 'Markdown',
                buttons: [
                    [ { text: 'Try Again', url: `${ frontendUrl }/payments/retry` } ],
                ],
            },
            wallet_deposit: {
                text: `💰 *Wallet Credited*\n\n` +
                    `Amount: {{currency}} {{amount}}\n` +
                    `New Balance: {{currency}} {{newBalance}}\n` +
                    `Transaction ID: \`{{transactionId}}\``,
                parseMode: 'Markdown',
                buttons: [
                    [ { text: 'View Wallet', url: `${ frontendUrl }/wallet` } ],
                ],
            },
            wallet_withdrawal: {
                text: `💸 *Withdrawal Processed*\n\n` +
                    `Amount: {{currency}} {{amount}}\n` +
                    `Remaining Balance: {{currency}} {{newBalance}}\n` +
                    `Transaction ID: \`{{transactionId}}\``,
                parseMode: 'Markdown',
            },
            system_announcement: {
                text: `📢 *System Announcement*\n\n{{message}}`,
                parseMode: 'Markdown',
            },
        };

        return templates[ type ];
    }

    /**
     * Send to admin
     */
    async sendToAdmin( text ) {
        if ( !this.adminChatId ) {
            return { success: false, error: 'Admin chat ID not configured' };
        }

        return this.sendMessage( {
            chatId: this.adminChatId,
            text,
        } );
    }

    /**
     * Send alert to admin
     */
    async sendAlert( title, message, severity = 'info' ) {
        const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅',
        };

        const icon = icons[ severity ] || icons.info;

        return this.sendToAdmin(
            `${ icon } *${ title }*\n\n${ message }\n\n_${ new Date().toLocaleString() }_`
        );
    }

    /**
     * Test Telegram configuration
     */
    async sendTestMessage( chatId ) {
        return this.sendMessage( {
            chatId,
            text: `🤖 *Test Message*\n\n` +
                `This is a test message from Virtual Trading Platform.\n\n` +
                `If you received this, your Telegram notifications are working!`,
        } );
    }

    /**
     * Get bot info
     */
    async getBotInfo() {
        if ( !this.isConfigured || !this.bot ) {
            return null;
        }

        try {
            const info = await this.bot.getMe();
            return {
                id: info.id,
                username: info.username,
                firstName: info.first_name,
                isBot: info.is_bot,
            };
        } catch ( error ) {
            console.error( 'Get bot info error:', error );
            return null;
        }
    }
}

module.exports = new TelegramProvider();
