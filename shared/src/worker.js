/**
 * Cloudflare Worker for Shared Service
 * Exposes shared utilities as API endpoints
 */

// Import Cloudflare-compatible shared utilities
import shared from './cloudflare-shared.js';

export default {
    async fetch( request, env, ctx ) {
        const url = new URL( request.url );
        const path = url.pathname;

        // Set CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Region, X-Language',
        };

        // Handle preflight requests
        if ( request.method === 'OPTIONS' ) {
            return new Response( null, {
                headers: corsHeaders,
            } );
        }

        try {
            // Route requests
            if ( path === '/health' ) {
                return handleHealth( request, env, corsHeaders );
            } else if ( path.startsWith( '/currencies' ) ) {
                return handleCurrencies( request, env, corsHeaders, path );
            } else if ( path.startsWith( '/regions' ) ) {
                return handleRegions( request, env, corsHeaders, path );
            } else if ( path.startsWith( '/i18n' ) ) {
                return handleI18n( request, env, corsHeaders, path );
            } else if ( path.startsWith( '/convert' ) ) {
                return handleConvert( request, env, corsHeaders, url );
            } else {
                return jsonResponse( {
                    error: 'Not found',
                    message: 'Available endpoints: /health, /currencies, /regions, /i18n, /convert'
                }, 404, corsHeaders );
            }
        } catch ( error ) {
            console.error( 'Worker error:', error );
            return jsonResponse( {
                error: 'Internal server error',
                message: error.message
            }, 500, corsHeaders );
        }
    },
};

// Health check endpoint
async function handleHealth( request, env, corsHeaders ) {
    return jsonResponse( {
        status: 'healthy',
        service: 'shared-service',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    }, 200, corsHeaders );
}

// Currency endpoints
async function handleCurrencies( request, env, corsHeaders, path ) {
    if ( path === '/currencies' || path === '/currencies/' ) {
        // Get all currencies
        const currencies = shared.Currency.getAllCurrencies();
        return jsonResponse( {
            currencies,
            count: Object.keys( currencies ).length
        }, 200, corsHeaders );
    } else if ( path === '/currencies/supported' ) {
        // Get supported currency codes
        const supported = shared.Currency.getSupportedCurrencies();
        return jsonResponse( {
            supported,
            count: supported.length
        }, 200, corsHeaders );
    } else {
        // Get specific currency
        const currencyCode = path.split( '/' ).pop().toUpperCase();
        if ( shared.Currency.isValidCurrency( currencyCode ) ) {
            const currency = shared.Currency.getCurrency( currencyCode );
            return jsonResponse( currency, 200, corsHeaders );
        } else {
            return jsonResponse( {
                error: 'Invalid currency code',
                supported: shared.Currency.getSupportedCurrencies()
            }, 400, corsHeaders );
        }
    }
}

// Region endpoints
async function handleRegions( request, env, corsHeaders, path ) {
    if ( path === '/regions' || path === '/regions/' ) {
        // Get all regions
        const regions = shared.Region.getAllRegions();
        return jsonResponse( {
            regions,
            count: Object.keys( regions ).length
        }, 200, corsHeaders );
    } else if ( path === '/regions/supported' ) {
        // Get supported region codes
        const supported = shared.Region.getSupportedRegions();
        return jsonResponse( {
            supported,
            count: supported.length
        }, 200, corsHeaders );
    } else {
        // Get specific region
        const regionCode = path.split( '/' ).pop().toUpperCase();
        if ( shared.Region.isValidRegion( regionCode ) ) {
            const region = shared.Region.getRegion( regionCode );
            return jsonResponse( region, 200, corsHeaders );
        } else {
            return jsonResponse( {
                error: 'Invalid region code',
                supported: shared.Region.getSupportedRegions()
            }, 400, corsHeaders );
        }
    }
}

// i18n endpoints
async function handleI18n( request, env, corsHeaders, path ) {
    if ( path === '/i18n/languages' ) {
        // Get supported languages
        return jsonResponse( {
            languages: shared.supportedLanguages,
            default: shared.defaultLanguage
        }, 200, corsHeaders );
    } else if ( path.startsWith( '/i18n/translate' ) ) {
        // Handle translation requests
        const params = new URL( request.url ).searchParams;
        const key = params.get( 'key' );
        const language = params.get( 'language' ) || 'en';

        if ( !key ) {
            return jsonResponse( {
                error: 'Missing translation key'
            }, 400, corsHeaders );
        }

        try {
            const translated = shared.translate( key, { lng: language } );
            return jsonResponse( {
                key,
                language,
                translation: translated
            }, 200, corsHeaders );
        } catch ( error ) {
            return jsonResponse( {
                error: 'Translation failed',
                message: error.message
            }, 500, corsHeaders );
        }
    } else {
        return jsonResponse( {
            error: 'Invalid i18n endpoint',
            available: [ '/i18n/languages', '/i18n/translate?key=...&language=...' ]
        }, 404, corsHeaders );
    }
}

// Currency conversion endpoint
async function handleConvert( request, env, corsHeaders, url ) {
    const params = url.searchParams;
    const amount = parseFloat( params.get( 'amount' ) );
    const from = params.get( 'from' );
    const to = params.get( 'to' );

    if ( !amount || !from || !to ) {
        return jsonResponse( {
            error: 'Missing required parameters: amount, from, to'
        }, 400, corsHeaders );
    }

    if ( !shared.Currency.isValidCurrency( from ) || !shared.Currency.isValidCurrency( to ) ) {
        return jsonResponse( {
            error: 'Invalid currency code',
            supported: shared.Currency.getSupportedCurrencies()
        }, 400, corsHeaders );
    }

    try {
        const converted = await shared.Currency.convert( amount, from, to );
        const rate = await shared.Currency.getExchangeRate( from, to );

        return jsonResponse( {
            amount,
            from,
            to,
            converted,
            rate,
            timestamp: new Date().toISOString()
        }, 200, corsHeaders );
    } catch ( error ) {
        return jsonResponse( {
            error: 'Conversion failed',
            message: error.message
        }, 500, corsHeaders );
    }
}

// Helper function for JSON responses
function jsonResponse( data, status = 200, corsHeaders = {} ) {
    return new Response( JSON.stringify( data, null, 2 ), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    } );
}
