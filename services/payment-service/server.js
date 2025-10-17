require( 'dotenv' ).config();
const express = require( 'express' );
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const rateLimit = require( 'express-rate-limit' );
const connectDB = require( './src/config/database' );
const paymentRoutes = require( './src/routes/paymentRoutes' );
const errorHandler = require( './src/middleware/errorHandler' );
const requestLogger = require( './src/middleware/requestLogger' );

const app = express();
const PORT = process.env.PORT || 3005;

// Connect to database
connectDB();

// Security middleware
app.use( helmet() );
app.use( cors() );

// Rate limiting
const limiter = rateLimit( {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP',
} );
app.use( '/api/', limiter );

// Webhook routes need raw body
app.use(
    '/api/payments/webhook',
    express.raw( { type: 'application/json' } )
);

// Body parser
app.use( express.json( { limit: '10mb' } ) );
app.use( express.urlencoded( { extended: true, limit: '10mb' } ) );

// Request logging
app.use( requestLogger );

// Health check
app.get( '/health', async ( req, res ) => {
    try {
        const mongoose = require( 'mongoose' );
        const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

        res.json( {
            success: true,
            service: 'payment-service',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            gateways: {
                stripe: !!process.env.STRIPE_SECRET_KEY,
                razer: !!process.env.RAZER_MERCHANT_ID,
                fpx: !!process.env.FPX_SELLER_ID,
                usdt: !!process.env.USDT_WALLET_ADDRESS,
            },
        } );
    } catch ( error ) {
        res.status( 500 ).json( {
            success: false,
            service: 'payment-service',
            status: 'unhealthy',
            error: error.message,
        } );
    }
} );

// Routes
app.use( '/api/payments', paymentRoutes );

// 404 handler
app.use( ( req, res ) => {
    res.status( 404 ).json( {
        success: false,
        error: 'Route not found',
    } );
} );

// Error handler
app.use( errorHandler );

// Start server
const server = app.listen( PORT, () => {
    console.log( `Payment Service running on port ${ PORT }` );
    console.log( `Environment: ${ process.env.NODE_ENV || 'development' }` );
    console.log( 'Enabled gateways:' );
    if ( process.env.STRIPE_SECRET_KEY ) console.log( '  - Stripe' );
    if ( process.env.RAZER_MERCHANT_ID ) console.log( '  - Razer Gold' );
    if ( process.env.FPX_SELLER_ID ) console.log( '  - FPX' );
    if ( process.env.USDT_WALLET_ADDRESS ) console.log( '  - USDT' );
} );

// Graceful shutdown
process.on( 'SIGTERM', () => {
    console.log( 'SIGTERM received, closing server...' );
    server.close( () => {
        console.log( 'Server closed' );
        process.exit( 0 );
    } );
} );

module.exports = app;
