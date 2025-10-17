require( 'dotenv' ).config();
const express = require( 'express' );
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const rateLimit = require( 'express-rate-limit' );
const connectDB = require( './src/config/database' );
const notificationRoutes = require( './src/routes/notificationRoutes' );
const preferenceRoutes = require( './src/routes/preferenceRoutes' );
const templateRoutes = require( './src/routes/templateRoutes' );
const errorHandler = require( './src/middleware/errorHandler' );
const requestLogger = require( './src/middleware/requestLogger' );
const emailProvider = require( './src/providers/emailProvider' );
const telegramProvider = require( './src/providers/telegramProvider' );

const app = express();
const PORT = process.env.PORT || 3006;

// Connect to database
connectDB();

// Initialize notification providers
emailProvider.init();
telegramProvider.init();

// Enable Telegram bot polling (optional - for bot commands)
if ( process.env.ENABLE_TELEGRAM_POLLING === 'true' ) {
    telegramProvider.enablePolling();
}

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

        // Check providers
        const emailStatus = emailProvider.isConfigured;
        const telegramStatus = telegramProvider.isConfigured;

        res.json( {
            success: true,
            service: 'notification-service',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: dbStatus,
            providers: {
                email: emailStatus,
                telegram: telegramStatus,
            },
        } );
    } catch ( error ) {
        res.status( 500 ).json( {
            success: false,
            service: 'notification-service',
            status: 'unhealthy',
            error: error.message,
        } );
    }
} );

// Routes
app.use( '/api/notifications', notificationRoutes );
app.use( '/api/notifications/preferences', preferenceRoutes );
app.use( '/api/notifications/templates', templateRoutes );

// 404 handler
app.use( ( req, res ) => {
    res.status( 404 ).json( {
        success: false,
        error: 'Route not found',
    } );
} );

// Error handler
app.use( errorHandler );

// Background job to process pending notifications (every 1 minute)
const processNotifications = async () => {
    try {
        const axios = require( 'axios' );
        await axios.post( `http://localhost:${ PORT }/api/notifications/process`, {}, {
            headers: {
                'Authorization': `Bearer ${ process.env.INTERNAL_API_KEY || 'internal' }`,
            },
        } );
    } catch ( error ) {
        console.error( 'Process notifications job error:', error.message );
    }
};

// Background job to retry failed notifications (every 5 minutes)
const retryFailedNotifications = async () => {
    try {
        const axios = require( 'axios' );
        await axios.post( `http://localhost:${ PORT }/api/notifications/retry`, {}, {
            headers: {
                'Authorization': `Bearer ${ process.env.INTERNAL_API_KEY || 'internal' }`,
            },
        } );
    } catch ( error ) {
        console.error( 'Retry notifications job error:', error.message );
    }
};

// Start server
const server = app.listen( PORT, () => {
    console.log( `Notification Service running on port ${ PORT }` );
    console.log( `Environment: ${ process.env.NODE_ENV || 'development' }` );
    console.log( 'Notification providers:' );
    if ( emailProvider.isConfigured ) {
        console.log( '  ✅ Email (SMTP) configured' );
    } else {
        console.log( '  ⚠️  Email not configured' );
    }
    if ( telegramProvider.isConfigured ) {
        console.log( '  ✅ Telegram Bot configured' );
    } else {
        console.log( '  ⚠️  Telegram not configured' );
    }

    // Start background jobs
    if ( process.env.ENABLE_BACKGROUND_JOBS !== 'false' ) {
        console.log( 'Starting background jobs...' );

        // Process pending notifications every 1 minute
        setInterval( processNotifications, 60 * 1000 );

        // Retry failed notifications every 5 minutes
        setInterval( retryFailedNotifications, 5 * 60 * 1000 );

        console.log( '  ✅ Background jobs started' );
    }
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
