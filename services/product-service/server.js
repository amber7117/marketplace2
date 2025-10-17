const express = require( 'express' );
const mongoose = require( 'mongoose' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const morgan = require( 'morgan' );
const rateLimit = require( 'express-rate-limit' );
const compression = require( 'compression' );
const path = require( 'path' );
require( 'dotenv' ).config( { path: path.join( __dirname, '.env' ) } );

const productRoutes = require( './src/routes/productRoutes' );
const categoryRoutes = require( './src/routes/categoryRoutes' );
const errorHandler = require( './src/middleware/errorHandler' );
const connectDB = require( './src/config/database' );

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use( helmet() );
const allowedOrigins = [
    'http://localhost:3001',      // ← 你要新增的
    // 可选：本地前端/预览域名
    'http://localhost:3002',
    // 可选：线上域名
    'https://topupforme.com',
    'https://www.topupforme.com'
];

app.use(
    cors( {
        origin( origin, callback ) {
            // 允许同源或无 Origin 的请求（如 curl/服务器间调用）
            if ( !origin ) return callback( null, true );
            if ( allowedOrigins.includes( origin ) ) return callback( null, true );
            return callback( new Error( 'Not allowed by CORS' ) );
        },
        credentials: true,
        methods: [ 'GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ],
        allowedHeaders: [ 'Content-Type', 'Authorization', 'X-Requested-With' ],
        exposedHeaders: [ 'Content-Length' ]
    } )
);

// 处理预检请求（可选但推荐）
app.options( '*', cors() );
app.use( compression() );

// Logging
app.use( morgan( process.env.NODE_ENV === 'production' ? 'combined' : 'dev' ) );

// Rate limiting
const limiter = rateLimit( {
    windowMs: 15 * 60 * 1000, // 15 minutes
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
        service: 'product-service',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    } );
} );

// Routes
app.use( '/products', productRoutes );
app.use( '/categories', categoryRoutes );

// Global error handler
app.use( errorHandler );

const PORT = process.env.PORT || 3002;

const server = app.listen( PORT, () => {
    console.log( `📦 Product Service running on port ${ PORT }` );
} );

// Graceful shutdown
process.on( 'SIGTERM', () => {
    console.log( 'Product Service: SIGTERM received, shutting down gracefully...' );
    server.close( () => {
        mongoose.connection.close();
        process.exit( 0 );
    } );
} );

module.exports = app;
