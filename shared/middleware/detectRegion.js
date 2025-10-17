/**
 * Region Detection Middleware
 * Detects user's region from IP, headers, or query parameters
 */

const { detectRegion, getRegion, getDefaultLanguage } = require( '../config/regions' );

/**
 * Detect region middleware
 * Sets req.region, req.currency, req.timezone
 */
function detectRegionMiddleware( req, res, next ) {
    let regionCode = null;

    // Priority 1: Query parameter
    if ( req.query.region ) {
        regionCode = req.query.region.toUpperCase();
    }

    // Priority 2: X-Region header
    if ( !regionCode && req.headers[ 'x-region' ] ) {
        regionCode = req.headers[ 'x-region' ].toUpperCase();
    }

    // Priority 3: CloudFront-Viewer-Country header (AWS CloudFront)
    if ( !regionCode && req.headers[ 'cloudfront-viewer-country' ] ) {
        const country = req.headers[ 'cloudfront-viewer-country' ];
        regionCode = detectRegion( country );
    }

    // Priority 4: CF-IPCountry header (Cloudflare)
    if ( !regionCode && req.headers[ 'cf-ipcountry' ] ) {
        const country = req.headers[ 'cf-ipcountry' ];
        regionCode = detectRegion( country );
    }

    // Priority 5: Default to GLOBAL
    if ( !regionCode ) {
        regionCode = 'GLOBAL';
    }

    // Get region configuration
    const region = getRegion( regionCode );

    if ( region ) {
        req.region = region.code;
        req.regionConfig = region;
        req.currency = region.currency;
        req.timezone = region.timezone;
        req.defaultLanguage = region.defaultLanguage;
    } else {
        // Fallback to GLOBAL
        const globalRegion = getRegion( 'GLOBAL' );
        req.region = 'GLOBAL';
        req.regionConfig = globalRegion;
        req.currency = globalRegion.currency;
        req.timezone = globalRegion.timezone;
        req.defaultLanguage = globalRegion.defaultLanguage;
    }

    next();
}

/**
 * Require specific region middleware
 * Returns 403 if user is not in allowed regions
 */
function requireRegion( ...allowedRegions ) {
    return ( req, res, next ) => {
        const upperAllowed = allowedRegions.map( r => r.toUpperCase() );

        if ( !upperAllowed.includes( req.region ) ) {
            return res.status( 403 ).json( {
                success: false,
                error: 'This service is not available in your region',
                allowedRegions: allowedRegions,
                currentRegion: req.region,
            } );
        }

        next();
    };
}

/**
 * Add region info to response
 */
function addRegionToResponse( req, res, next ) {
    const originalJson = res.json.bind( res );

    res.json = function ( data ) {
        if ( data && typeof data === 'object' && !data.region ) {
            data.region = req.region;
            data.currency = req.currency;
        }
        return originalJson( data );
    };

    next();
}

module.exports = {
    detectRegionMiddleware,
    requireRegion,
    addRegionToResponse,
};
