const mongoose = require( 'mongoose' );

const notificationTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
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
        },
        channel: {
            type: String,
            required: true,
            enum: [ 'email', 'telegram', 'both' ],
        },
        subject: {
            type: String,
            required: true,
        },
        emailTemplate: {
            html: {
                type: String,
            },
            text: {
                type: String,
            },
        },
        telegramTemplate: {
            text: {
                type: String,
            },
            parseMode: {
                type: String,
                enum: [ 'Markdown', 'HTML' ],
                default: 'Markdown',
            },
        },
        variables: [
            {
                name: {
                    type: String,
                    required: true,
                },
                description: {
                    type: String,
                },
                required: {
                    type: Boolean,
                    default: false,
                },
                defaultValue: {
                    type: String,
                },
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
        metadata: {
            description: {
                type: String,
            },
            category: {
                type: String,
                enum: [ 'transactional', 'promotional', 'system' ],
                default: 'transactional',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for fast lookup
notificationTemplateSchema.index( { name: 1, isActive: 1 } );
notificationTemplateSchema.index( { type: 1 } );

// Instance methods
notificationTemplateSchema.methods.render = function ( data ) {
    const Handlebars = require( 'handlebars' );

    const result = {
        subject: this.subject,
        channel: this.channel,
    };

    // Render email template
    if ( this.channel === 'email' || this.channel === 'both' ) {
        if ( this.emailTemplate.html ) {
            const htmlTemplate = Handlebars.compile( this.emailTemplate.html );
            result.html = htmlTemplate( data );
        }
        if ( this.emailTemplate.text ) {
            const textTemplate = Handlebars.compile( this.emailTemplate.text );
            result.text = textTemplate( data );
        }
    }

    // Render telegram template
    if ( this.channel === 'telegram' || this.channel === 'both' ) {
        if ( this.telegramTemplate.text ) {
            const telegramTemplate = Handlebars.compile( this.telegramTemplate.text );
            result.telegramText = telegramTemplate( data );
            result.parseMode = this.telegramTemplate.parseMode;
        }
    }

    return result;
};

notificationTemplateSchema.methods.validateData = function ( data ) {
    const errors = [];

    this.variables.forEach( ( variable ) => {
        if ( variable.required && !data[ variable.name ] ) {
            errors.push( `Missing required variable: ${ variable.name }` );
        }
    } );

    return {
        valid: errors.length === 0,
        errors,
    };
};

// Static methods
notificationTemplateSchema.statics.getByName = function ( name ) {
    return this.findOne( { name, isActive: true } );
};

notificationTemplateSchema.statics.getByType = function ( type ) {
    return this.find( { type, isActive: true } );
};

notificationTemplateSchema.statics.getAllActive = function () {
    return this.find( { isActive: true } ).sort( { name: 1 } );
};

const NotificationTemplate = mongoose.model(
    'NotificationTemplate',
    notificationTemplateSchema
);

module.exports = NotificationTemplate;
