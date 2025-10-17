const jwt = require( 'jsonwebtoken' );
const User = require( '../models/User' );

const authMiddleware = async ( req, res, next ) => {
    try {
        // Get token from header
        const token = req.header( 'Authorization' )?.replace( 'Bearer ', '' );

        if ( !token ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'No token provided, authorization denied'
            } );
        }

        // Verify token
        const decoded = jwt.verify( token, process.env.JWT_SECRET );

        // Get user from token
        const user = await User.findById( decoded.id ).select( '-password' );

        if ( !user ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'User not found, authorization denied'
            } );
        }

        // Add user to request object
        req.user = user;
        next();
    } catch ( error ) {
        if ( error.name === 'JsonWebTokenError' ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'Invalid token'
            } );
        }
        if ( error.name === 'TokenExpiredError' ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'Token expired'
            } );
        }
        res.status( 500 ).json( {
            success: false,
            error: 'Server error in authentication'
        } );
    }
};

module.exports = authMiddleware;
