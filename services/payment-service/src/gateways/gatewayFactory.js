const stripeGateway = require( './stripeGateway' );
const razerGateway = require( './razerGateway' );
const fpxGateway = require( './fpxGateway' );
const usdtGateway = require( './usdtGateway' );

class GatewayFactory {
    /**
     * Get gateway instance by name
     */
    static getGateway( gatewayName ) {
        switch ( gatewayName.toLowerCase() ) {
            case 'stripe':
                return stripeGateway;
            case 'razer':
                return razerGateway;
            case 'fpx':
                return fpxGateway;
            case 'usdt':
                return usdtGateway;
            default:
                throw new Error( `Unsupported payment gateway: ${ gatewayName }` );
        }
    }

    /**
     * Get available gateways
     */
    static getAvailableGateways() {
        return [
            {
                name: 'stripe',
                displayName: 'Credit/Debit Card',
                currencies: [ 'USD', 'MYR', 'SGD', 'EUR' ],
                enabled: !!process.env.STRIPE_SECRET_KEY,
            },
            {
                name: 'razer',
                displayName: 'Razer Gold',
                currencies: [ 'MYR', 'SGD', 'USD' ],
                enabled: !!process.env.RAZER_MERCHANT_ID,
            },
            {
                name: 'fpx',
                displayName: 'FPX Online Banking',
                currencies: [ 'MYR' ],
                enabled: !!process.env.FPX_SELLER_ID,
            },
            {
                name: 'usdt',
                displayName: 'USDT Cryptocurrency',
                currencies: [ 'USDT' ],
                enabled: !!process.env.USDT_WALLET_ADDRESS,
            },
        ];
    }

    /**
     * Validate gateway supports currency
     */
    static validateGatewayCurrency( gatewayName, currency ) {
        const gateways = this.getAvailableGateways();
        const gateway = gateways.find( ( g ) => g.name === gatewayName );

        if ( !gateway ) {
            throw new Error( 'Gateway not found' );
        }

        if ( !gateway.enabled ) {
            throw new Error( 'Gateway is not enabled' );
        }

        if ( !gateway.currencies.includes( currency ) ) {
            throw new Error( `Gateway ${ gatewayName } does not support currency ${ currency }` );
        }

        return true;
    }
}

module.exports = GatewayFactory;
