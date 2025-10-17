const express = require( 'express' );
const mongoose = require( 'mongoose' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const morgan = require( 'morgan' );
const rateLimit = require( 'express-rate-limit' );
const compression = require( 'compression' );
require( 'dotenv' ).config();

const orderRoutes = require( './src/routes/orderRoutes' );
const errorHandler = require( './src/middleware/errorHandler' );
const connectDB = require( './src/config/database' );

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use( helmet() );
app.use( cors() );
app.use( compression() );

// Logging
app.use( morgan( process.env.NODE_ENV === 'production' ? 'combined' : 'dev' ) );

// Rate limiting
const limiter = rateLimit( {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
} );

app.use( limiter );

// Body parsing middleware
app.use( express.json( { limit: '10mb' } ) );
app.use( express.urlencoded( { extended: true } ) );

// Health check
app.get( '/health', ( req, res ) => {
    res.status( 200 ).json( {
        status: 'OK',
        service: 'order-service',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    } );
} );

// Routes
app.use( '/', orderRoutes );

// Global error handler
app.use( errorHandler );

const PORT = process.env.PORT || 3003;

const server = app.listen( PORT, () => {
    console.log( `🛒 Order Service running on port ${ PORT }` );
} );

// Graceful shutdown
process.on( 'SIGTERM', () => {
    console.log( 'Order Service: SIGTERM received, shutting down gracefully...' );
    server.close( () => {
        mongoose.connection.close();
        process.exit( 0 );
    } );
} );

module.exports = app;
