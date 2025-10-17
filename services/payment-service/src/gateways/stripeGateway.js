const stripe = require( 'stripe' )( process.env.STRIPE_SECRET_KEY );

class StripeGateway {
    /**
     * Create payment intent for topup
     */
    async createPaymentIntent( amount, currency, metadata = {} ) {
        try {
            const paymentIntent = await stripe.paymentIntents.create( {
                amount: Math.round( amount * 100 ), // Convert to cents
                currency: currency.toLowerCase(),
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            } );

            return {
                success: true,
                data: {
                    clientSecret: paymentIntent.client_secret,
                    paymentIntentId: paymentIntent.id,
                    status: paymentIntent.status,
                },
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.message,
                code: error.code,
            };
        }
    }

    /**
     * Confirm payment
     */
    async confirmPayment( paymentIntentId ) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve( paymentIntentId );

            return {
                success: paymentIntent.status === 'succeeded',
                data: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    amount: paymentIntent.amount / 100,
                    currency: paymentIntent.currency,
                    receiptUrl: paymentIntent.charges?.data[ 0 ]?.receipt_url,
                    chargeId: paymentIntent.charges?.data[ 0 ]?.id,
                },
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Create customer
     */
    async createCustomer( email, name, metadata = {} ) {
        try {
            const customer = await stripe.customers.create( {
                email,
                name,
                metadata,
            } );

            return {
                success: true,
                data: {
                    customerId: customer.id,
                    email: customer.email,
                },
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Save payment method
     */
    async attachPaymentMethod( paymentMethodId, customerId ) {
        try {
            const paymentMethod = await stripe.paymentMethods.attach( paymentMethodId, {
                customer: customerId,
            } );

            return {
                success: true,
                data: {
                    id: paymentMethod.id,
                    type: paymentMethod.type,
                    card: paymentMethod.card ? {
                        brand: paymentMethod.card.brand,
                        last4: paymentMethod.card.last4,
                        expiryMonth: paymentMethod.card.exp_month,
                        expiryYear: paymentMethod.card.exp_year,
                    } : null,
                },
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Create refund
     */
    async createRefund( chargeId, amount = null ) {
        try {
            const refundData = { charge: chargeId };
            if ( amount ) {
                refundData.amount = Math.round( amount * 100 );
            }

            const refund = await stripe.refunds.create( refundData );

            return {
                success: true,
                data: {
                    refundId: refund.id,
                    amount: refund.amount / 100,
                    status: refund.status,
                },
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature( payload, signature ) {
        try {
            const event = stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
            return { success: true, event };
        } catch ( error ) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle webhook event
     */
    async handleWebhookEvent( event ) {
        switch ( event.type ) {
            case 'payment_intent.succeeded':
                return {
                    type: 'payment_completed',
                    paymentIntentId: event.data.object.id,
                    amount: event.data.object.amount / 100,
                    status: 'succeeded',
                };

            case 'payment_intent.payment_failed':
                return {
                    type: 'payment_failed',
                    paymentIntentId: event.data.object.id,
                    error: event.data.object.last_payment_error?.message,
                };

            case 'charge.refunded':
                return {
                    type: 'refund_completed',
                    chargeId: event.data.object.id,
                    amount: event.data.object.amount_refunded / 100,
                };

            default:
                return {
                    type: 'unhandled',
                    eventType: event.type,
                };
        }
    }
}

module.exports = new StripeGateway();
