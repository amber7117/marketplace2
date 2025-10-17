const errorHandler = ( err, req, res, next ) => {
    console.error( 'Error:', err );

    // Mongoose validation error
    if ( err.name === 'ValidationError' ) {
        const errors = Object.values( err.errors ).map( ( e ) => ( {
            field: e.path,
            message: e.message,
        } ) );

        return res.status( 400 ).json( {
            success: false,
            error: 'Validation error',
            details: errors,
        } );
    }

    // Mongoose duplicate key error
    if ( err.code === 11000 ) {
        return res.status( 400 ).json( {
            success: false,
            error: 'Duplicate entry',
            details: err.keyValue,
        } );
    }

    // JWT errors
    if ( err.name === 'JsonWebTokenError' ) {
        return res.status( 401 ).json( {
            success: false,
            error: 'Invalid token',
        } );
    }

    if ( err.name === 'TokenExpiredError' ) {
        return res.status( 401 ).json( {
            success: false,
            error: 'Token expired',
        } );
    }

    // Default error
    res.status( err.statusCode || 500 ).json( {
        success: false,
        error: err.message || 'Internal server error',
    } );
};

module.exports = errorHandler;
