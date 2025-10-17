const nodemailer = require( 'nodemailer' );

class EmailProvider {
    constructor() {
        this.transporter = null;
        this.isConfigured = false;
    }

    /**
     * Initialize email transporter
     */
    init() {
        try {
            this.transporter = nodemailer.createTransport( {
                host: process.env.SMTP_HOST,
                port: parseInt( process.env.SMTP_PORT || '587' ),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            } );

            this.isConfigured = !!(
                process.env.SMTP_HOST &&
                process.env.SMTP_USER &&
                process.env.SMTP_PASSWORD
            );

            if ( this.isConfigured ) {
                console.log( '✅ Email provider configured' );
            } else {
                console.warn( '⚠️  Email provider not configured' );
            }
        } catch ( error ) {
            console.error( '❌ Email provider initialization failed:', error.message );
            this.isConfigured = false;
        }
    }

    /**
     * Verify email configuration
     */
    async verify() {
        if ( !this.isConfigured || !this.transporter ) {
            return { success: false, error: 'Email provider not configured' };
        }

        try {
            await this.transporter.verify();
            return { success: true };
        } catch ( error ) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Send email
     */
    async sendEmail( { to, subject, text, html, attachments = [] } ) {
        if ( !this.isConfigured || !this.transporter ) {
            return {
                success: false,
                error: 'Email provider not configured',
            };
        }

        try {
            const mailOptions = {
                from: `"${ process.env.EMAIL_FROM_NAME }" <${ process.env.EMAIL_FROM }>`,
                to,
                subject,
                text,
                html,
                attachments,
            };

            const info = await this.transporter.sendMail( mailOptions );

            return {
                success: true,
                messageId: info.messageId,
                response: info.response,
            };
        } catch ( error ) {
            console.error( 'Email send error:', error );
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Send bulk emails
     */
    async sendBulkEmails( emails ) {
        const results = [];

        for ( const email of emails ) {
            const result = await this.sendEmail( email );
            results.push( {
                to: email.to,
                success: result.success,
                messageId: result.messageId,
                error: result.error,
            } );
        }

        return results;
    }

    /**
     * Send template email
     */
    async sendTemplateEmail( { to, templateName, templateData, subject } ) {
        const Handlebars = require( 'handlebars' );

        // Load template (in production, load from file or database)
        const template = this.getTemplate( templateName );

        if ( !template ) {
            return {
                success: false,
                error: `Template ${ templateName } not found`,
            };
        }

        // Compile and render template
        const htmlTemplate = Handlebars.compile( template.html );
        const textTemplate = Handlebars.compile( template.text );

        const html = htmlTemplate( templateData );
        const text = textTemplate( templateData );

        return this.sendEmail( {
            to,
            subject: subject || template.subject,
            html,
            text,
        } );
    }

    /**
     * Get email template (placeholder - should load from DB/file)
     */
    getTemplate( templateName ) {
        const templates = {
            order_created: {
                subject: 'Order Confirmation - {{orderId}}',
                html: `
          <h2>Order Confirmation</h2>
          <p>Thank you for your order!</p>
          <p><strong>Order ID:</strong> {{orderId}}</p>
          <p><strong>Total:</strong> {{currency}} {{amount}}</p>
          <p><strong>Status:</strong> {{status}}</p>
          <p><a href="{{frontendUrl}}/orders/{{orderId}}">View Order</a></p>
        `,
                text: `
          Order Confirmation
          
          Thank you for your order!
          Order ID: {{orderId}}
          Total: {{currency}} {{amount}}
          Status: {{status}}
          
          View Order: {{frontendUrl}}/orders/{{orderId}}
        `,
            },
            payment_completed: {
                subject: 'Payment Successful - {{paymentId}}',
                html: `
          <h2>Payment Successful</h2>
          <p>Your payment has been processed successfully!</p>
          <p><strong>Payment ID:</strong> {{paymentId}}</p>
          <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
          <p><strong>Date:</strong> {{date}}</p>
          <p><a href="{{frontendUrl}}/payments/{{paymentId}}">View Receipt</a></p>
        `,
                text: `
          Payment Successful
          
          Your payment has been processed successfully!
          Payment ID: {{paymentId}}
          Amount: {{currency}} {{amount}}
          Date: {{date}}
          
          View Receipt: {{frontendUrl}}/payments/{{paymentId}}
        `,
            },
            wallet_deposit: {
                subject: 'Wallet Credited - {{currency}} {{amount}}',
                html: `
          <h2>Wallet Credited</h2>
          <p>Your wallet has been credited!</p>
          <p><strong>Amount:</strong> {{currency}} {{amount}}</p>
          <p><strong>New Balance:</strong> {{currency}} {{newBalance}}</p>
          <p><strong>Transaction ID:</strong> {{transactionId}}</p>
          <p><a href="{{frontendUrl}}/wallet">View Wallet</a></p>
        `,
                text: `
          Wallet Credited
          
          Your wallet has been credited!
          Amount: {{currency}} {{amount}}
          New Balance: {{currency}} {{newBalance}}
          Transaction ID: {{transactionId}}
          
          View Wallet: {{frontendUrl}}/wallet
        `,
            },
        };

        return templates[ templateName ];
    }

    /**
     * Test email configuration
     */
    async sendTestEmail( to ) {
        return this.sendEmail( {
            to,
            subject: 'Test Email from Virtual Trading Platform',
            text: 'This is a test email to verify your email configuration.',
            html: '<p>This is a test email to verify your email configuration.</p>',
        } );
    }
}

module.exports = new EmailProvider();
