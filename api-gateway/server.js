const express = require( 'express' );
const cors = require( 'cors' );
const helmet = require( 'helmet' );
const morgan = require( 'morgan' );
const compression = require( 'compression' );
const rateLimit = require( 'express-rate-limit' );
require( 'dotenv' ).config();

const serviceRoutes = require( './src/routes/serviceRoutes' );
const authMiddleware = require( './src/middleware/auth' );
const errorHandler = require( './src/middleware/errorHandler' );
const serviceRegistry = require( './src/config/serviceRegistry' );

const app = express();

// Initialize service registry
serviceRegistry.init();

// Security middleware
app.use( helmet() );


// 开发环境允许所有本地前端跨域访问
app.use(
  cors( {
    origin: [
      'http://topupforme.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003'
    ],
    credentials: true,
    methods: [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization', 'X-User-ID', 'X-User-Role' ],
    optionsSuccessStatus: 204
  } )
);



// Compression
app.use( compression() );

// Logging
app.use( morgan( process.env.NODE_ENV === 'production' ? 'combined' : 'dev' ) );

// Rate limiting
const limiter = rateLimit( {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
} );

app.use( '/api/', limiter );

// Body parsing middleware
app.use( express.json( { limit: '10mb' } ) );
app.use( express.urlencoded( { extended: true, limit: '10mb' } ) );

// Health check
app.get( '/health', ( req, res ) => {
  res.status( 200 ).json( {
    status: 'OK',
    message: 'API Gateway is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: serviceRegistry.getHealthStatus()
  } );
} );

// API routes with service proxying
app.use( '/api', serviceRoutes );

// Welcome route
app.get( '/', ( req, res ) => {
  res.json( {
    message: 'Virtual Trading Platform API Gateway',
    version: '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    services: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
      wallet: '/api/wallet',
      payments: '/api/payments',
      notifications: '/api/notifications'
    }
  } );
} );

// 404 handler
app.use( '*', ( req, res ) => {
  res.status( 404 ).json( {
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  } );
} );

// Global error handler
app.use( errorHandler );

const PORT = process.env.PORT || 3000;

const server = app.listen( PORT, () => {
  console.log( `🚀 API Gateway running on port ${ PORT }` );
  console.log( `📱 Health check available at http://localhost:${ PORT }/health` );
} );

// Graceful shutdown
process.on( 'SIGTERM', () => {
  console.log( 'SIGTERM received. Shutting down gracefully...' );
  server.close( () => {
    console.log( 'API Gateway terminated' );
    serviceRegistry.cleanup();
  } );
} );

process.on( 'unhandledRejection', ( err, promise ) => {
  console.log( 'Unhandled Promise Rejection:', err.message );
  server.close( () => {
    process.exit( 1 );
  } );
} );

module.exports = app;