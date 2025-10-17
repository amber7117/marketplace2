require( 'dotenv' ).config();
const express = require( 'express' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const rateLimit = require( 'express-rate-limit' );
const connectDB = require( './src/config/database' );
const walletRoutes = require( './src/routes/walletRoutes' );
const errorHandler = require( './src/middleware/errorHandler' );

const app = express();
const PORT = process.env.PORT || 3004;

// Connect to database
connectDB();

// Middleware
app.use( helmet() );
app.use( cors() );
app.use( express.json( { limit: '10mb' } ) );
app.use( express.urlencoded( { extended: true, limit: '10mb' } ) );

// Rate limiting
const limiter = rateLimit( {
    windowMs: parseInt( process.env.RATE_LIMIT_WINDOW_MS ) || 15 * 60 * 1000,
    max: parseInt( process.env.RATE_LIMIT_MAX_REQUESTS ) || 1000,
    message: {
        success: false,
        error: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
} );

app.use( limiter );

// Request logging
app.use( ( req, res, next ) => {
    console.log( `${ new Date().toISOString() } - ${ req.method } ${ req.path }` );
    next();
} );

// Health check
app.get( '/health', async ( req, res ) => {
    const mongoose = require( 'mongoose' );
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    res.json( {
        success: true,
        service: 'wallet-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbStatus,
    } );
} );

// Routes
app.use( '/', walletRoutes );

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
    console.log( `
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   💰 Wallet Service                                   ║
║                                                       ║
║   Status: ✅ Running                                  ║
║   Port: ${ PORT }                                        ║
║   Environment: ${ process.env.NODE_ENV || 'development' }                           ║
║   Database: ${ process.env.MONGODB_URI?.includes( 'localhost' ) ? 'Local MongoDB' : 'Remote MongoDB' }                              ║
║                                                       ║
║   Endpoints:                                          ║
║   - GET    /health                                    ║
║   - GET    /wallet                                    ║
║   - POST   /wallet/deposit                            ║
║   - POST   /wallet/deduct                             ║
║   - POST   /wallet/refund                             ║
║   - GET    /wallet/transactions                       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
} );

// Graceful shutdown
process.on( 'SIGTERM', () => {
    console.log( '⚠️  SIGTERM received. Shutting down gracefully...' );
    server.close( () => {
        console.log( '✅ Server closed' );
        process.exit( 0 );
    } );
} );

process.on( 'SIGINT', () => {
    console.log( '⚠️  SIGINT received. Shutting down gracefully...' );
    server.close( () => {
        console.log( '✅ Server closed' );
        process.exit( 0 );
    } );
} );

module.exports = app;
