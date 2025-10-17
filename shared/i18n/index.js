/**
 * i18n Configuration
 * Multi-language support for EN, TH, MY, CN, VI
 */

const i18next = require( 'i18next' );
const Backend = require( 'i18next-fs-backend' );
const path = require( 'path' );

const supportedLanguages = [ 'en', 'th', 'my', 'cn', 'vi' ];
const defaultLanguage = 'en';

// Initialize i18next
i18next
    .use( Backend )
    .init( {
        fallbackLng: defaultLanguage,
        supportedLngs: supportedLanguages,
        preload: supportedLanguages,

        // Backend options
        backend: {
            loadPath: path.join( __dirname, 'locales', '{{lng}}.json' ),
        },

        // Interpolation options
        interpolation: {
            escapeValue: false, // Not needed for API
        },

        // Default namespace
        defaultNS: 'translation',

        // Load translations synchronously
        initImmediate: false,
    } );

/**
 * Get translation function for specific language
 * @param {string} lng - Language code
 * @returns {Function} Translation function
 */
function getTranslator( lng = defaultLanguage ) {
    return i18next.getFixedT( lng );
}

/**
 * Translate key
 * @param {string} key - Translation key
 * @param {string} lng - Language code
 * @param {Object} options - Interpolation options
 * @returns {string} Translated text
 */
function translate( key, lng = defaultLanguage, options = {} ) {
    return i18next.t( key, { ...options, lng } );
}

/**
 * Check if language is supported
 * @param {string} lng - Language code
 * @returns {boolean} True if supported
 */
function isLanguageSupported( lng ) {
    return supportedLanguages.includes( lng?.toLowerCase() );
}

/**
 * Get language name
 * @param {string} lng - Language code
 * @returns {string} Language name
 */
function getLanguageName( lng ) {
    const names = {
        en: 'English',
        th: 'ไทย',
        my: 'Bahasa Melayu',
        cn: '中文',
        vi: 'Tiếng Việt',
    };
    return names[ lng?.toLowerCase() ] || 'Unknown';
}

/**
 * Detect language from Accept-Language header
 * @param {string} acceptLanguage - Accept-Language header value
 * @returns {string} Detected language code
 */
function detectLanguage( acceptLanguage ) {
    if ( !acceptLanguage ) return defaultLanguage;

    // Parse Accept-Language header
    const languages = acceptLanguage
        .split( ',' )
        .map( lang => {
            const [ code, q = '1.0' ] = lang.trim().split( ';q=' );
            return {
                code: code.split( '-' )[ 0 ].toLowerCase(),
                quality: parseFloat( q ),
            };
        } )
        .sort( ( a, b ) => b.quality - a.quality );

    // Find first supported language
    for ( const lang of languages ) {
        if ( isLanguageSupported( lang.code ) ) {
            return lang.code;
        }
    }

    return defaultLanguage;
}

module.exports = {
    i18next,
    supportedLanguages,
    defaultLanguage,
    getTranslator,
    translate,
    isLanguageSupported,
    getLanguageName,
    detectLanguage,
};
