const jwt = require( 'jsonwebtoken' );

const authMiddleware = async ( req, res, next ) => {
    try {
        // Check for token in headers
        const token = req.headers.authorization?.split( ' ' )[ 1 ];

        if ( !token ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'No token provided',
            } );
        }

        // Verify token
        const decoded = jwt.verify( token, process.env.JWT_SECRET );

        // Attach user info to headers for downstream services
        req.headers[ 'x-user-id' ] = decoded.userId;
        req.headers[ 'x-user-role' ] = decoded.role;

        next();
    } catch ( error ) {
        if ( error.name === 'JsonWebTokenError' ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'Invalid token',
            } );
        }

        if ( error.name === 'TokenExpiredError' ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'Token expired',
            } );
        }

        res.status( 500 ).json( {
            success: false,
            error: 'Authentication failed',
        } );
    }
};

module.exports = authMiddleware;
