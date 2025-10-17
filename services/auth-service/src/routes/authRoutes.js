const express = require( 'express' );
const router = express.Router();
const {
    register,
    login,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
} = require( '../controllers/authController' );
const authMiddleware = require( '../middleware/authMiddleware' );

// Public routes
router.post( '/api/auth/register', register );
router.post( '/api/auth/login', login );
router.post( '/api/auth/refresh-token', refreshToken );
router.post( '/api/auth/forgot-password', forgotPassword );
router.post( '/api/auth/reset-password', resetPassword );
router.get( '/api/auth/verify-email/:token', verifyEmail );

// Protected routes (require authentication)
router.post( '/api/auth/logout', authMiddleware, logout );
router.get( '/api/auth/profile', authMiddleware, getProfile );
router.put( '/api/auth/profile', authMiddleware, updateProfile );
router.post( '/api/auth/change-password', authMiddleware, changePassword );

module.exports = router;
