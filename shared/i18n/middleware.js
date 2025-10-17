/**
 * i18n Middleware for Express
 */

const i18nextMiddleware = require( 'i18next-http-middleware' );
const { i18next, detectLanguage } = require( './index' );

/**
 * Express middleware for i18next
 */
const i18nMiddleware = i18nextMiddleware.handle( i18next, {
    // Remove language from path
    removeLngFromUrl: false,
} );

/**
 * Language detection middleware
 * Sets req.language and req.t() function
 */
function languageDetector( req, res, next ) {
    // Priority: 1. Query param, 2. Header, 3. Cookie, 4. Default
    let language = req.query.lang || req.query.language;

    if ( !language ) {
        const acceptLanguage = req.headers[ 'accept-language' ];
        language = detectLanguage( acceptLanguage );
    }

    // Set language on request
    req.language = language;
    req.lng = language;

    // Add translation function to request
    req.t = i18next.getFixedT( language );

    next();
}

/**
 * Response helper to include language in JSON responses
 */
function languageResponseHelper( req, res, next ) {
    // Store original json function
    const originalJson = res.json.bind( res );

    // Override json function
    res.json = function ( data ) {
        // Add language to response if not present
        if ( data && typeof data === 'object' && !data.language ) {
            data.language = req.language || 'en';
        }
        return originalJson( data );
    };

    next();
}

module.exports = {
    i18nMiddleware,
    languageDetector,
    languageResponseHelper,
};
