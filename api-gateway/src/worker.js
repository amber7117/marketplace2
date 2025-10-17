// Cloudflare Worker adapter for Express API Gateway
export default {
    async fetch( request, env, ctx ) {
        const url = new URL( request.url );
        const pathname = url.pathname;

        const allowedOrigins = [
            'https://topupforme.com',
            'https://www.topupforme.com',
            'http://localhost:3002'
        ];

        const origin = req.headers.origin;
        if ( allowedOrigins.includes( origin ) ) {
            corsHeaders[ 'Access-Control-Allow-Origin' ] = origin;
        }



        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': env.API_URL || 'allowedOrigins',

            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials': 'true'
        };

        // Handle preflight requests
        if ( request.method === 'OPTIONS' ) {
            return new Response( null, {
                status: 200,
                headers: corsHeaders
            } );
        }

        try {
            console.log( 'API Gateway received request:', pathname );

            // Route requests to appropriate services
            if ( pathname.startsWith( '/api/auth' ) ) {
                const servicePath = pathname.replace( '/api/auth', '' );
                console.log( 'Routing to auth service:', env.AUTH_SERVICE_URL + servicePath );
                return await routeToService( request, env.AUTH_SERVICE_URL, servicePath );
            } else if ( pathname.startsWith( '/api/products' ) ) {
                let servicePath = pathname.replace( '/api/products', '' );
                // If the path becomes empty after stripping, use '/products'
                if ( servicePath === '' || servicePath === '/' ) {
                    servicePath = '/products';
                } else {
                    // For other paths, prepend '/products' to maintain the correct route
                    servicePath = '/products' + servicePath;
                }
                console.log( 'Routing to product service:', env.PRODUCT_SERVICE_URL + servicePath );
                return await routeToService( request, env.PRODUCT_SERVICE_URL, servicePath );
            } else if ( pathname.startsWith( '/api/orders' ) ) {
                const servicePath = pathname.replace( '/api/orders', '' );
                console.log( 'Routing to order service:', env.ORDER_SERVICE_URL + servicePath );
                return await routeToService( request, env.ORDER_SERVICE_URL, servicePath );
            } else if ( pathname.startsWith( '/api/wallet' ) ) {
                const servicePath = pathname.replace( '/api/wallet', '' );
                console.log( 'Routing to wallet service:', env.WALLET_SERVICE_URL + servicePath );
                return await routeToService( request, env.WALLET_SERVICE_URL, servicePath );
            } else if ( pathname.startsWith( '/api/payments' ) ) {
                const servicePath = pathname.replace( '/api/payments', '' );
                console.log( 'Routing to payment service:', env.PAYMENT_SERVICE_URL + servicePath );
                return await routeToService( request, env.PAYMENT_SERVICE_URL, servicePath );
            } else if ( pathname.startsWith( '/api/notifications' ) ) {
                const servicePath = pathname.replace( '/api/notifications', '' );
                console.log( 'Routing to notification service:', env.NOTIFICATION_SERVICE_URL + servicePath );
                return await routeToService( request, env.NOTIFICATION_SERVICE_URL, servicePath );
            } else {
                console.log( 'No matching service found for path:', pathname );
                return new Response( 'Service not found', {
                    status: 404,
                    headers: corsHeaders
                } );
            }
        } catch ( error ) {
            console.error( 'API Gateway error:', error );
            return new Response( JSON.stringify( { error: 'Internal server error' } ), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders
                }
            } );
        }
    }
};

async function routeToService( request, serviceUrl, pathname ) {
    const url = new URL( request.url );
    const targetUrl = `${ serviceUrl }${ pathname }${ url.search }`;

    const headers = new Headers( request.headers );

    // Remove Cloudflare-specific headers that might cause issues
    headers.delete( 'cf-connecting-ip' );
    headers.delete( 'cf-ray' );
    headers.delete( 'cf-visitor' );

    const init = {
        method: request.method,
        headers: headers,
        body: request.body
    };

    const response = await fetch( targetUrl, init );

    // Return response with CORS headers
    const responseHeaders = new Headers( response.headers );
    responseHeaders.set( 'Access-Control-Allow-Origin', '*' );
    responseHeaders.set( 'Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS' );
    responseHeaders.set( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With' );

    return new Response( response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
    } );
}
