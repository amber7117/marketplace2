const axios = require( 'axios' );
const crypto = require( 'crypto' );

class FPXGateway {
    constructor() {
        this.sellerId = process.env.FPX_SELLER_ID;
        this.sellerExchangeId = process.env.FPX_SELLER_EXCHANGE_ID;
        this.sellerBankCode = process.env.FPX_SELLER_BANK_CODE;
        this.apiUrl = process.env.FPX_API_URL;
    }

    /**
     * Generate checksum for FPX
     */
    generateChecksum( data, key ) {
        const sortedKeys = Object.keys( data ).sort( ( a, b ) => a.localeCompare( b ) );
        const checksumString = sortedKeys
            .map( ( k ) => data[ k ] )
            .join( '|' );

        return crypto
            .createHmac( 'sha256', key )
            .update( checksumString )
            .digest( 'hex' );
    }

    /**
     * Create payment (FPX Authorization Request)
     */
    async createPayment( amount, orderId, buyerName, buyerEmail, buyerBankId ) {
        try {
            const fpxData = {
                fpx_msgType: 'AE',
                fpx_msgToken: '01',
                fpx_sellerExId: this.sellerExchangeId,
                fpx_sellerId: this.sellerId,
                fpx_sellerOrderNo: orderId,
                fpx_sellerBankCode: this.sellerBankCode,
                fpx_sellerTxnTime: this.getCurrentTimestamp(),
                fpx_txnAmount: amount.toFixed( 2 ),
                fpx_txnCurrency: 'MYR',
                fpx_buyerEmail: buyerEmail,
                fpx_buyerName: buyerName,
                fpx_buyerBankId: buyerBankId,
                fpx_productDesc: 'Topup',
                fpx_version: 'B2C1.0',
            };

            // Add checksum
            fpxData.fpx_checkSum = this.generateChecksum( fpxData, this.secretKey );

            // Return payment URL (FPX uses redirect flow)
            const paymentUrl = `${ this.apiUrl }/FPXMain/seller2DReceiver.jsp`;

            return {
                success: true,
                data: {
                    paymentUrl,
                    paymentData: fpxData,
                    orderId,
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
     * Get current timestamp in FPX format
     */
    getCurrentTimestamp() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String( now.getMonth() + 1 ).padStart( 2, '0' );
        const day = String( now.getDate() ).padStart( 2, '0' );
        const hour = String( now.getHours() ).padStart( 2, '0' );
        const minute = String( now.getMinutes() ).padStart( 2, '0' );
        const second = String( now.getSeconds() ).padStart( 2, '0' );

        return `${ year }${ month }${ day }${ hour }${ minute }${ second }`;
    }

    /**
     * Verify callback checksum
     */
    verifyCallbackChecksum( callbackData, receivedChecksum ) {
        const expectedChecksum = this.generateChecksum( callbackData, this.secretKey );
        return expectedChecksum === receivedChecksum;
    }

    /**
     * Handle callback
     */
    async handleCallback( callbackData ) {
        const {
            fpx_debitAuthCode,
            fpx_debitAuthNo,
            fpx_sellerOrderNo,
            fpx_txnAmount,
            fpx_txnCurrency,
            fpx_checkSum,
        } = callbackData;

        // Verify checksum
        const dataForChecksum = { ...callbackData };
        delete dataForChecksum.fpx_checkSum;

        if ( !this.verifyCallbackChecksum( dataForChecksum, fpx_checkSum ) ) {
            return {
                success: false,
                error: 'Invalid checksum',
            };
        }

        // FPX status codes: 00 = Successful, others = Failed
        const isSuccess = fpx_debitAuthCode === '00';

        return {
            success: true,
            data: {
                transactionId: fpx_debitAuthNo,
                orderId: fpx_sellerOrderNo,
                status: isSuccess ? 'completed' : 'failed',
                amount: parseFloat( fpx_txnAmount ),
                currency: fpx_txnCurrency,
                authCode: fpx_debitAuthCode,
            },
        };
    }

    /**
     * Get list of FPX banks
     */
    getBankList() {
        return [
            { code: 'ABB0233', name: 'Affin Bank' },
            { code: 'ABMB0212', name: 'Alliance Bank' },
            { code: 'AMBB0209', name: 'AmBank' },
            { code: 'BIMB0340', name: 'Bank Islam' },
            { code: 'BKRM0602', name: 'Bank Rakyat' },
            { code: 'BMMB0341', name: 'Bank Muamalat' },
            { code: 'BSN0601', name: 'BSN' },
            { code: 'CIT0219', name: 'Citibank' },
            { code: 'HLB0224', name: 'Hong Leong Bank' },
            { code: 'HSBC0223', name: 'HSBC Bank' },
            { code: 'KFH0346', name: 'Kuwait Finance House' },
            { code: 'MB2U0227', name: 'Maybank' },
            { code: 'MBB0228', name: 'Maybank' },
            { code: 'OCBC0229', name: 'OCBC Bank' },
            { code: 'PBB0233', name: 'Public Bank' },
            { code: 'RHB0218', name: 'RHB Bank' },
            { code: 'SCB0216', name: 'Standard Chartered' },
            { code: 'UOB0226', name: 'UOB Bank' },
        ];
    }
}

module.exports = new FPXGateway();
