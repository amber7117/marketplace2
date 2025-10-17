const axios = require( 'axios' );

class USDTGateway {
    constructor() {
        this.walletAddress = process.env.USDT_WALLET_ADDRESS;
        this.network = process.env.USDT_NETWORK || 'TRC20'; // TRC20 or ERC20
        this.apiUrl = process.env.USDT_API_URL;
    }

    /**
     * Generate payment address (for now, use merchant wallet)
     */
    async generatePaymentAddress( orderId ) {
        try {
            // In production, you might want to generate unique addresses
            // For now, we'll use the merchant wallet address

            return {
                success: true,
                data: {
                    address: this.walletAddress,
                    network: this.network,
                    orderId,
                    qrCodeUrl: this.generateQRCodeUrl( this.walletAddress ),
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
     * Generate QR code URL for payment
     */
    generateQRCodeUrl( address ) {
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${ address }`;
    }

    /**
     * Check transaction status on blockchain
     */
    async checkTransaction( txHash ) {
        try {
            let response;

            if ( this.network === 'TRC20' ) {
                // TronGrid API for TRC20 USDT
                response = await axios.get(
                    `${ this.apiUrl }/v1/transactions/${ txHash }`,
                    {
                        headers: {
                            'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY,
                        },
                    }
                );

                const txData = response.data;

                // Verify USDT contract interaction
                return {
                    success: true,
                    data: {
                        txHash,
                        status: txData.ret[ 0 ].contractRet === 'SUCCESS' ? 'confirmed' : 'failed',
                        from: this.base58ToHex( txData.raw_data.contract[ 0 ].parameter.value.owner_address ),
                        to: this.walletAddress,
                        amount: this.parseUSDTAmount( txData ),
                        confirmations: txData.blockNumber ? 1 : 0,
                        timestamp: txData.blockTimeStamp,
                    },
                };
            } else {
                // ERC20 USDT (Ethereum)
                // Would use Etherscan or Infura API
                return {
                    success: false,
                    error: 'ERC20 not fully implemented',
                };
            }
        } catch ( error ) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }

    /**
     * Parse USDT amount from transaction
     */
    parseUSDTAmount( txData ) {
        const parameter = txData?.raw_data?.contract?.[ 0 ]?.parameter?.value;
        if ( !parameter || parameter.amount === undefined ) {
            throw new Error( 'Missing USDT amount in transaction data' );
        }

        const rawAmount = parameter.amount;
        let amountValue;

        if ( typeof rawAmount === 'string' ) {
            const radix = rawAmount.startsWith( '0x' ) ? 16 : 10;
            amountValue = parseInt( rawAmount, radix );
        } else {
            amountValue = Number( rawAmount );
        }

        if ( Number.isNaN( amountValue ) ) {
            throw new Error( 'Invalid USDT amount in transaction data' );
        }

        return amountValue / 1000000;
    }

    /**
     * Convert base58 to hex (for Tron addresses)
     */
    base58ToHex( base58 ) {
        // Simplified conversion - in production use proper library
        return base58;
    }

    /**
     * Verify payment (manual verification flow)
     */
    async verifyPayment( txHash, expectedAmount, expectedAddress ) {
        try {
            const result = await this.checkTransaction( txHash );

            if ( !result.success ) {
                return result;
            }

            const tx = result.data;

            // Verify transaction details
            const isValid =
                tx.status === 'confirmed' &&
                tx.to.toLowerCase() === expectedAddress.toLowerCase() &&
                tx.amount >= expectedAmount;

            return {
                success: true,
                verified: isValid,
                data: tx,
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.message,
            };
        }
    }

    /**
     * Get USDT balance of merchant wallet
     */
    async getBalance() {
        try {
            if ( this.network === 'TRC20' ) {
                const response = await axios.get(
                    `${ this.apiUrl }/v1/accounts/${ this.walletAddress }/tokens`,
                    {
                        headers: {
                            'TRON-PRO-API-KEY': process.env.TRONGRID_API_KEY,
                        },
                    }
                );

                // Find USDT token
                const usdtContract = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
                const usdtToken = response.data.data.find(
                    ( token ) => token.tokenId === usdtContract
                );

                return {
                    success: true,
                    balance: usdtToken ? parseFloat( usdtToken.balance ) / 1000000 : 0,
                };
            }

            return {
                success: false,
                error: 'Network not supported',
            };
        } catch ( error ) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

module.exports = new USDTGateway();
