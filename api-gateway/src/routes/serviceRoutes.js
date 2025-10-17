const express = require( 'express' );
const { createProxyMiddleware } = require( 'http-proxy-middleware' );
const serviceRegistry = require( '../config/serviceRegistry' );
const authMiddleware = require( '../middleware/auth' );
const requestLogger = require( '../middleware/requestLogger' );

const router = express.Router();

// Middleware for all API routes
router.use( requestLogger );

// Auth Service Routes (Public)
router.use( '/auth', createProxyMiddleware( {
  target: () => serviceRegistry.getServiceUrl( 'auth-service' ),
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '/api/auth'
  },
  onError: ( err, req, res ) => {
    console.error( 'Auth Service Error:', err.message );
    res.status( 503 ).json( {
      success: false,
      error: 'Auth service temporarily unavailable'
    } );
  }
} ) );

// Product Service Routes (Public)
router.use( '/products', createProxyMiddleware( {
  target: () => serviceRegistry.getServiceUrl( 'product-service' ),
  changeOrigin: true,
  pathRewrite: {
    '^/products': '/products'
  },
  onError: ( err, req, res ) => {
    console.error( 'Product Service Error:', err.message );
    res.status( 503 ).json( {
      success: false,
      error: 'Product service temporarily unavailable'
    } );
  }
} ) );

// Protected routes - require authentication
router.use( authMiddleware );

// Order Service Routes (Protected)
router.use( '/orders', createProxyMiddleware( {
  target: () => serviceRegistry.getServiceUrl( 'order-service' ),
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': ''
  },
  onProxyReq: ( proxyReq, req, res ) => {
    // Forward user information to service
    if ( req.user ) {
      proxyReq.setHeader( 'X-User-ID', req.user.id );
      proxyReq.setHeader( 'X-User-Role', req.user.role );
    }
  },
  onError: ( err, req, res ) => {
    console.error( 'Order Service Error:', err.message );
    res.status( 503 ).json( {
      success: false,
      error: 'Order service temporarily unavailable'
    } );
  }
} ) );

// Wallet Service Routes (Protected)
router.use( '/wallet', createProxyMiddleware( {
  target: () => serviceRegistry.getServiceUrl( 'wallet-service' ),
  changeOrigin: true,
  pathRewrite: {
    '^/api/wallet': ''
  },
  onProxyReq: ( proxyReq, req, res ) => {
    if ( req.user ) {
      proxyReq.setHeader( 'X-User-ID', req.user.id );
      proxyReq.setHeader( 'X-User-Role', req.user.role );
    }
  },
  onError: ( err, req, res ) => {
    console.error( 'Wallet Service Error:', err.message );
    res.status( 503 ).json( {
      success: false,
      error: 'Wallet service temporarily unavailable'
    } );
  }
} ) );

// Payment Service Routes (Protected)
router.use( '/payments', createProxyMiddleware( {
  target: () => serviceRegistry.getServiceUrl( 'payment-service' ),
  changeOrigin: true,
  pathRewrite: {
    '^/api/payments': ''
  },
  onProxyReq: ( proxyReq, req, res ) => {
    if ( req.user ) {
      proxyReq.setHeader( 'X-User-ID', req.user.id );
      proxyReq.setHeader( 'X-User-Role', req.user.role );
    }
  },
  onError: ( err, req, res ) => {
    console.error( 'Payment Service Error:', err.message );
    res.status( 503 ).json( {
      success: false,
      error: 'Payment service temporarily unavailable'
    } );
  }
} ) );

// Notification Service Routes (Protected)
router.use( '/notifications', createProxyMiddleware( {
  target: () => serviceRegistry.getServiceUrl( 'notification-service' ),
  changeOrigin: true,
  pathRewrite: {
    '^/api/notifications': ''
  },
  onProxyReq: ( proxyReq, req, res ) => {
    if ( req.user ) {
      proxyReq.setHeader( 'X-User-ID', req.user.id );
      proxyReq.setHeader( 'X-User-Role', req.user.role );
    }
  },
  onError: ( err, req, res ) => {
    console.error( 'Notification Service Error:', err.message );
    res.status( 503 ).json( {
      success: false,
      error: 'Notification service temporarily unavailable'
    } );
  }
} ) );

module.exports = router;
