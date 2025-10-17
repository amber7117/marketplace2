const { validationResult } = require( 'express-validator' );

const validate = ( req, res, next ) => {
    const errors = validationResult( req );

    if ( !errors.isEmpty() ) {
        return res.status( 400 ).json( {
            success: false,
            error: 'Validation failed',
            details: errors.array().map( ( err ) => ( {
                field: err.path || err.param,
                message: err.msg,
            } ) ),
        } );
    }

    next();
};

module.exports = validate;
