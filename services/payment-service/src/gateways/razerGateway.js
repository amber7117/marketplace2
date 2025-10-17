const axios = require( 'axios' );
const crypto = require( 'crypto' );

class RazerGoldGateway {
    constructor() {
        this.merchantId = process.env.RAZER_MERCHANT_ID;
        this.secretKey = process.env.RAZER_SECRET_KEY;
        this.apiUrl = process.env.RAZER_API_URL;
    }

    /**
     * Generate signature for Razer Gold
     */
    generateSignature( data ) {
        const sortedKeys = Object.keys( data ).sort( ( a, b ) => a.localeCompare( b ) );
        const signatureString = sortedKeys
            .map( ( key ) => `${ key }=${ data[ key ] }` )
            .join( '&' );

        return crypto
            .createHmac( 'sha256', this.secretKey )
            .update( signatureString )
            .digest( 'hex' );
    }

    /**
     * Create payment
     */
    async createPayment( amount, currency, orderId, metadata = {} ) {
        try {
            const paymentData = {
                merchant_id: this.merchantId,
                order_id: orderId,
                amount: amount.toFixed( 2 ),
                currency,
                timestamp: Date.now(),
                ...metadata,
            };

            paymentData.signature = this.generateSignature( paymentData );

            const response = await axios.post(
                `${ this.apiUrl }/v1/payments`,
                paymentData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            return {
                success: true,
                data: {
                    transactionId: response.data.transaction_id,
                    paymentUrl: response.data.payment_url,
                    status: response.data.status,
                },
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                code: error.response?.data?.code,
            };
        }
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus( transactionId ) {
        try {
            const requestData = {
                merchant_id: this.merchantId,
                transaction_id: transactionId,
                timestamp: Date.now(),
            };

            requestData.signature = this.generateSignature( requestData );

            const response = await axios.get(
                `${ this.apiUrl }/v1/payments/${ transactionId }`,
                {
                    params: requestData,
                }
            );

            return {
                success: true,
                data: {
                    transactionId: response.data.transaction_id,
                    status: response.data.status,
                    amount: parseFloat( response.data.amount ),
                    currency: response.data.currency,
                },
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }

    /**
     * Verify callback signature
     */
    verifyCallbackSignature( callbackData, receivedSignature ) {
        const expectedSignature = this.generateSignature( callbackData );
        return expectedSignature === receivedSignature;
    }

    /**
     * Handle callback
     */
    async handleCallback( callbackData ) {
        const { transaction_id, status, amount, signature } = callbackData;

        // Verify signature
        if ( !this.verifyCallbackSignature( callbackData, signature ) ) {
            return {
                success: false,
                error: 'Invalid signature',
            };
        }

        return {
            success: true,
            data: {
                transactionId: transaction_id,
                status: status === 'success' ? 'completed' : 'failed',
                amount: parseFloat( amount ),
            },
        };
    }
}

module.exports = new RazerGoldGateway();
