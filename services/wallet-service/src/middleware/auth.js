const jwt = require( 'jsonwebtoken' );

const authMiddleware = async ( req, res, next ) => {
    try {
        // Check for user info from API Gateway headers (for service-to-service calls)
        const userId = req.headers[ 'x-user-id' ];
        const userRole = req.headers[ 'x-user-role' ];
        const userEmail = req.headers[ 'x-user-email' ];

        if ( userId ) {
            // User info from API Gateway
            req.user = {
                id: userId,
                role: userRole || 'user',
                email: userEmail || '',
            };
            return next();
        }

        // Check for JWT token in Authorization header
        const authHeader = req.headers.authorization;

        if ( !authHeader?.startsWith( 'Bearer ' ) ) {
            return res.status( 401 ).json( {
                success: false,
                error: 'No token provided. Authorization denied.',
            } );
        }

        const token = authHeader.split( ' ' )[ 1 ];

        try {
            // Verify token
            const decoded = jwt.verify( token, process.env.JWT_SECRET );

            // Attach user info to request
            req.user = {
                id: decoded.id || decoded.userId,
                email: decoded.email,
                role: decoded.role || 'user',
            };

            next();
        } catch ( error ) {
            console.warn( 'JWT verification failed:', error.message );
            return res.status( 401 ).json( {
                success: false,
                error: 'Invalid token. Authorization denied.',
            } );
        }
    } catch ( error ) {
        console.error( 'Auth middleware error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Server error in authentication',
        } );
    }
};

module.exports = authMiddleware;
