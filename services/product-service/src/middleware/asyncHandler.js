/**
 * Async handler to wrap async route handlers and automatically pass errors to next()
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = ( fn ) => ( req, res, next ) => {
    Promise.resolve( fn( req, res, next ) ).catch( next );
};

module.exports = asyncHandler;
