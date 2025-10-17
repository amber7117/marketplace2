/**
 * Usage Examples for Shared Module
 */

// ============================================
// Example 1: Currency Formatting and Conversion
// ============================================

const { Currency } = require( '@trading-platform/shared' );

// Format currency
const formatted = Currency.formatAmount( 1234.56, 'MYR' );
console.log( formatted ); // "RM 1,234.56"

// Convert currency
async function convertExample() {
    const converted = await Currency.convert( 100, 'USD', 'MYR' );
    console.log( `100 USD = ${ converted.toFixed( 2 ) } MYR` );
}

// Get currency info
const myr = Currency.getCurrency( 'MYR' );
console.log( myr );
// {
//   code: 'MYR',
//   name: 'Malaysian Ringgit',
//   symbol: 'RM',
//   decimalPlaces: 2,
//   ...
// }


// ============================================
// Example 2: Region Configuration
// ============================================

const { Region } = require( '@trading-platform/shared' );

// Get region config
const malaysia = Region.getRegion( 'MY' );
console.log( malaysia.currency ); // 'MYR'
console.log( malaysia.languages ); // ['en', 'my', 'cn']
console.log( malaysia.timezone ); // 'Asia/Kuala_Lumpur'

// Calculate tax
const total = Region.calculateTotal( 100, 'MY' );
console.log( total );
// {
//   subtotal: 100,
//   tax: 0,
//   total: 100
// }

// Check payment gateway availability
const isSupported = Region.isGatewaySupported( 'fpx', 'MY' );
console.log( isSupported ); // true


// ============================================
// Example 3: Multi-language Support
// ============================================

const { translate, getTranslator } = require( '@trading-platform/shared' );

// Direct translation
const welcome = translate( 'common.welcome', 'th' );
console.log( welcome ); // "ยินดีต้อนรับสู่แพลตฟอร์มเทรดเสมือน"

// Get translator function
const t = getTranslator( 'cn' );
console.log( t( 'product.addToCart' ) ); // "加入购物车"

// With interpolation
const hello = translate( 'common.hello', 'en', { name: 'John' } );
console.log( hello ); // "Hello, John"


// ============================================
// Example 4: Express Middleware Usage
// ============================================

const express = require( 'express' );
const {
    detectRegion,
    detectLanguage,
    addRegionToResponse,
    addLanguageToResponse
} = require( '@trading-platform/shared' );

const app = express();

// Apply middleware
app.use( detectRegion );
app.use( detectLanguage );
app.use( addRegionToResponse );
app.use( addLanguageToResponse );

// Use in routes
app.get( '/api/products', ( req, res ) => {
    // Access detected region and language
    console.log( req.region );      // 'MY'
    console.log( req.currency );    // 'MYR'
    console.log( req.language );    // 'en'

    // Use translation function
    const message = req.t( 'product.products' );

    res.json( {
        success: true,
        message,
        // region and language automatically added by middleware
    } );
} );


// ============================================
// Example 5: Product Service with Multi-Currency
// ============================================

const { Currency, Region } = require( '@trading-platform/shared' );

async function createProduct( productData, regionCode ) {
    const region = Region.getRegion( regionCode );

    // Store base price in USD
    const basePrice = productData.price;
    const baseCurrency = 'USD';

    // Convert to region currency
    const regionPrice = await Currency.convert(
        basePrice,
        baseCurrency,
        region.currency
    );

    const product = {
        name: productData.name,
        basePrice: basePrice,
        baseCurrency: baseCurrency,
        price: regionPrice,
        currency: region.currency,
        formattedPrice: Currency.formatAmount( regionPrice, region.currency ),
    };

    return product;
}


// ============================================
// Example 6: Order Service with Tax Calculation
// ============================================

const { Currency, Region } = require( '@trading-platform/shared' );

function calculateOrderTotal( items, regionCode ) {
    const region = Region.getRegion( regionCode );

    // Calculate subtotal
    const subtotal = items.reduce( ( sum, item ) => {
        return sum + ( item.price * item.quantity );
    }, 0 );

    // Calculate tax and total
    const { tax, total } = Region.calculateTotal( subtotal, regionCode );

    return {
        subtotal: Currency.formatAmount( subtotal, region.currency ),
        tax: Currency.formatAmount( tax, region.currency ),
        total: Currency.formatAmount( total, region.currency ),
        currency: region.currency,
        taxRate: region.taxRate,
        taxName: region.taxName,
    };
}


// ============================================
// Example 7: Payment Service with Gateway Selection
// ============================================

const { Region } = require( '@trading-platform/shared' );

function selectPaymentGateway( regionCode, preferredGateway ) {
    const availableGateways = Region.getPaymentGateways( regionCode );

    // Check if preferred gateway is available
    if ( preferredGateway && availableGateways.includes( preferredGateway ) ) {
        return preferredGateway;
    }

    // Return first available gateway
    return availableGateways[ 0 ];
}


// ============================================
// Example 8: Notification Service with Multi-language
// ============================================

const { translate } = require( '@trading-platform/shared' );

async function sendOrderNotification( order, userId, language ) {
    // Get translated messages
    const subject = translate( 'order.orderPlaced', language );
    const message = translate( 'order.orderDetails', language );

    // Send notification
    await notificationService.send( {
        userId,
        subject,
        message: `${ message }: ${ order.orderId }`,
        language,
    } );
}


// ============================================
// Example 9: Auto-update Exchange Rates on Startup
// ============================================

const { Currency } = require( '@trading-platform/shared' );

// In server.js
async function startServer() {
    // Start exchange rate auto-update (every 1 hour)
    Currency.startAutoUpdate( 3600000 );

    // Start Express server
    app.listen( PORT, () => {
        console.log( `Server running on port ${ PORT }` );
    } );
}

// Graceful shutdown
process.on( 'SIGTERM', () => {
    Currency.stopAutoUpdate();
    process.exit( 0 );
} );


// ============================================
// Example 10: Complete API Endpoint with All Features
// ============================================

app.get( '/api/products/:id', async ( req, res ) => {
    try {
        const productId = req.params.id;
        const region = req.region;          // From detectRegion middleware
        const currency = req.currency;      // From detectRegion middleware
        const language = req.language;      // From detectLanguage middleware
        const t = req.t;                    // Translation function

        // Get product
        const product = await Product.findById( productId );

        if ( !product ) {
            return res.status( 404 ).json( {
                success: false,
                error: t( 'product.productNotFound' ),
            } );
        }

        // Convert price to user's currency
        const convertedPrice = await Currency.convert(
            product.price,
            product.currency,
            currency
        );

        // Format price
        const formattedPrice = Currency.formatAmount( convertedPrice, currency );

        res.json( {
            success: true,
            data: {
                ...product.toObject(),
                price: convertedPrice,
                formattedPrice,
                currency,
            },
            message: t( 'common.success' ),
            // region and language automatically added by middleware
        } );

    } catch ( error ) {
        res.status( 500 ).json( {
            success: false,
            error: req.t( 'error.general' ),
        } );
    }
} );


module.exports = {
    // Export examples for documentation
    convertExample,
    createProduct,
    calculateOrderTotal,
    selectPaymentGateway,
    sendOrderNotification,
};
