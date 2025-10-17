/**
 * Language Detection Middleware
 * Detects user's preferred language
 */

const { detectLanguage, isLanguageSupported, getTranslator } = require( '../i18n' );

/**
 * Detect language middleware
 * Sets req.language and req.t() function
 */
function detectLanguageMiddleware( req, res, next ) {
    let language = null;

    // Priority 1: Query parameter
    if ( req.query.lang || req.query.language ) {
        const queryLang = ( req.query.lang || req.query.language ).toLowerCase();
        if ( isLanguageSupported( queryLang ) ) {
            language = queryLang;
        }
    }

    // Priority 2: X-Language header
    if ( !language && req.headers[ 'x-language' ] ) {
        const headerLang = req.headers[ 'x-language' ].toLowerCase();
        if ( isLanguageSupported( headerLang ) ) {
            language = headerLang;
        }
    }

    // Priority 3: Accept-Language header
    if ( !language && req.headers[ 'accept-language' ] ) {
        language = detectLanguage( req.headers[ 'accept-language' ] );
    }

    // Priority 4: Region default language
    if ( !language && req.defaultLanguage ) {
        language = req.defaultLanguage;
    }

    // Priority 5: Default to English
    if ( !language ) {
        language = 'en';
    }

    // Set language on request
    req.language = language;
    req.lng = language;

    // Add translation function to request
    req.t = getTranslator( language );

    next();
}

/**
 * Require specific language middleware
 * Returns 400 if language is not supported
 */
function requireLanguage( ...allowedLanguages ) {
    return ( req, res, next ) => {
        const lowerAllowed = allowedLanguages.map( l => l.toLowerCase() );

        if ( !lowerAllowed.includes( req.language ) ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Language not supported',
                allowedLanguages: allowedLanguages,
                currentLanguage: req.language,
            } );
        }

        next();
    };
}

/**
 * Add language info to response
 */
function addLanguageToResponse( req, res, next ) {
    const originalJson = res.json.bind( res );

    res.json = function ( data ) {
        if ( data && typeof data === 'object' && !data.language ) {
            data.language = req.language;
        }
        return originalJson( data );
    };

    next();
}

module.exports = {
    detectLanguageMiddleware,
    requireLanguage,
    addLanguageToResponse,
};
