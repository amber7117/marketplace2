/**
 * Cloudflare Worker for Product Service
 * Product management service using Cloudflare D1 database
 */

export default {
    async fetch( request, env, ctx ) {
        const url = new URL( request.url );
        const path = url.pathname;

        // Set CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        };

        // Handle preflight requests
        if ( request.method === 'OPTIONS' ) {
            return new Response( null, {
                headers: corsHeaders,
            } );
        }

        try {
            // Initialize database if needed
            await initializeDatabase( env.DB );

            // Route requests
            if ( path === '/health' ) {
                return handleHealth( request, env, corsHeaders );
            } else if ( path === '/products/featured' && request.method === 'GET' ) {
                return handleGetFeaturedProducts( request, env, corsHeaders );
            } else if ( path === '/products' && request.method === 'GET' ) {
                return handleGetProducts( request, env, corsHeaders, url );
            } else if ( path.startsWith( '/products/' ) && request.method === 'GET' ) {
                const pathParts = path.split( '/' ).filter( part => part );
                const identifier = pathParts[ 1 ];
                const action = pathParts[ 2 ];

                if ( identifier === 'featured' ) {
                    return handleGetFeaturedProducts( request, env, corsHeaders );
                } else if ( action === 'denominations' ) {
                    return handleGetProductDenominations( request, env, corsHeaders, identifier, url );
                } else if ( identifier.includes( 'with-variants' ) ) {
                    return handleGetProductWithVariants( request, env, corsHeaders, identifier );
                } else {
                    return handleGetProduct( request, env, corsHeaders, identifier );
                }
            } else if ( path === '/products' && request.method === 'POST' ) {
                return handleCreateProduct( request, env, corsHeaders );
            } else if ( path.startsWith( '/products/' ) && request.method === 'PUT' ) {
                const id = path.split( '/' ).pop();
                return handleUpdateProduct( request, env, corsHeaders, id );
            } else if ( path.startsWith( '/products/' ) && request.method === 'DELETE' ) {
                const id = path.split( '/' ).pop();
                return handleDeleteProduct( request, env, corsHeaders, id );
            } else if ( path.startsWith( '/products/' ) && path.endsWith( '/stock' ) && request.method === 'PATCH' ) {
                const id = path.split( '/' )[ 2 ];
                return handleUpdateStock( request, env, corsHeaders, id );
            } else {
                return jsonResponse( {
                    error: 'Not found',
                    message: 'Available endpoints: /health, /products, /products/featured, /products/:id, /products/:id/denominations, /products/:id/with-variants, /products/:id/stock'
                }, 404, corsHeaders );
            }
        } catch ( error ) {
            console.error( 'Product Worker error:', error );
            return jsonResponse( {
                error: 'Internal server error',
                message: error.message
            }, 500, corsHeaders );
        }
    },
};

// Initialize database tables
async function initializeDatabase( db ) {
    try {
        await db.exec( `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        type TEXT DEFAULT 'digital_code',
        is_active INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        images TEXT,
        tags TEXT,
        regional_pricing TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    } catch ( error ) {
        console.error( 'Database initialization error:', error );
    }
}

// Health check endpoint
async function handleHealth( request, env, corsHeaders ) {
    try {
        // Test database connection
        await env.DB.prepare( 'SELECT 1' ).run();

        return jsonResponse( {
            status: 'healthy',
            service: 'product-service',
            timestamp: new Date().toISOString(),
            database: 'connected'
        }, 200, corsHeaders );
    } catch ( error ) {
        return jsonResponse( {
            status: 'unhealthy',
            service: 'product-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        }, 503, corsHeaders );
    }
}

// Get all products with filtering and pagination
async function handleGetProducts( request, env, corsHeaders, url ) {
    try {
        const page = parseInt( url.searchParams.get( 'page' ) ) || 1;
        const limit = parseInt( url.searchParams.get( 'limit' ) ) || 20;
        const offset = ( page - 1 ) * limit;

        const category = url.searchParams.get( 'category' );
        const type = url.searchParams.get( 'type' );
        const isFeatured = url.searchParams.get( 'isFeatured' );
        const search = url.searchParams.get( 'search' );

        // Build WHERE clause
        let whereClause = 'WHERE is_active = 1';
        const params = [];

        if ( category ) {
            whereClause += ' AND category = ?';
            params.push( category );
        }

        if ( type ) {
            whereClause += ' AND type = ?';
            params.push( type );
        }

        if ( isFeatured !== null ) {
            whereClause += ' AND is_featured = ?';
            params.push( isFeatured === 'true' ? 1 : 0 );
        }

        if ( search ) {
            whereClause += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
            const searchTerm = `%${ search }%`;
            params.push( searchTerm, searchTerm, searchTerm );
        }

        // Get products
        const productsResult = await env.DB.prepare( `
      SELECT * FROM products 
      ${ whereClause }
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind( ...params, limit, offset ).all();

        // Get total count
        const countResult = await env.DB.prepare( `
      SELECT COUNT(*) as total FROM products ${ whereClause }
    `).bind( ...params ).first();

        const products = productsResult.results.map( product => ( {
            ...product,
            images: product.images ? JSON.parse( product.images ) : [],
            tags: product.tags ? JSON.parse( product.tags ) : [],
            regionalPricing: product.regional_pricing ? JSON.parse( product.regional_pricing ) : []
        } ) );

        return jsonResponse( {
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total: countResult.total,
                pages: Math.ceil( countResult.total / limit )
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get products error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get products'
        }, 500, corsHeaders );
    }
}

// Get single product by ID or slug
async function handleGetProduct( request, env, corsHeaders, identifier ) {
    try {
        let product;

        // Try to find by slug first
        product = await env.DB.prepare(
            'SELECT * FROM products WHERE (slug = ? OR id = ?) AND is_active = 1'
        ).bind( identifier, identifier ).first();

        if ( !product ) {
            return jsonResponse( {
                success: false,
                error: 'Product not found'
            }, 404, corsHeaders );
        }

        const formattedProduct = {
            ...product,
            images: product.images ? JSON.parse( product.images ) : [],
            tags: product.tags ? JSON.parse( product.tags ) : [],
            regionalPricing: product.regional_pricing ? JSON.parse( product.regional_pricing ) : []
        };

        return jsonResponse( {
            success: true,
            data: formattedProduct
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get product error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get product'
        }, 500, corsHeaders );
    }
}

// Get product with variants (simplified - returns same as getProduct for now)
async function handleGetProductWithVariants( request, env, corsHeaders, identifier ) {
    try {
        const cleanIdentifier = identifier.replace( '-with-variants', '' );
        return handleGetProduct( request, env, corsHeaders, cleanIdentifier );
    } catch ( error ) {
        console.error( 'Get product with variants error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get product with variants'
        }, 500, corsHeaders );
    }
}

// Get featured products
async function handleGetFeaturedProducts( request, env, corsHeaders ) {
    try {
        const limit = parseInt( new URL( request.url ).searchParams.get( 'limit' ) ) || 10;

        const productsResult = await env.DB.prepare( `
      SELECT * FROM products 
      WHERE is_active = 1 AND is_featured = 1
      ORDER BY created_at DESC 
      LIMIT ?
    `).bind( limit ).all();

        const products = productsResult.results.map( product => ( {
            ...product,
            images: product.images ? JSON.parse( product.images ) : [],
            tags: product.tags ? JSON.parse( product.tags ) : [],
            regionalPricing: product.regional_pricing ? JSON.parse( product.regional_pricing ) : []
        } ) );

        return jsonResponse( {
            success: true,
            data: products
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get featured products error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get featured products'
        }, 500, corsHeaders );
    }
}

// Get product denominations (面额数据)
async function handleGetProductDenominations( request, env, corsHeaders, identifier, url ) {
    try {
        // Find product by ID or slug
        let product = await env.DB.prepare(
            'SELECT * FROM products WHERE (slug = ? OR id = ?) AND is_active = 1'
        ).bind( identifier, identifier ).first();

        if ( !product ) {
            return jsonResponse( {
                success: false,
                error: 'Product not found'
            }, 404, corsHeaders );
        }

        // Parse regional pricing data
        const regionalPricing = product.regional_pricing ? JSON.parse( product.regional_pricing ) : [];

        // Get filter parameters
        const region = url.searchParams.get( 'region' );
        const currency = url.searchParams.get( 'currency' );
        const inStockOnly = url.searchParams.get( 'inStockOnly' ) === 'true';
        const minPrice = parseFloat( url.searchParams.get( 'minPrice' ) ) || null;
        const maxPrice = parseFloat( url.searchParams.get( 'maxPrice' ) ) || null;

        // Filter denominations
        let denominations = regionalPricing.slice();

        // Filter by region
        if ( region ) {
            denominations = denominations.filter( d => d.region === region );
        }

        // Filter by currency
        if ( currency ) {
            denominations = denominations.filter( d => d.currency === currency );
        }

        // Filter by price range
        if ( minPrice !== null || maxPrice !== null ) {
            denominations = denominations.filter( d => {
                const finalPrice = d.discountPrice || d.price;
                const meetsMin = minPrice === null || finalPrice >= minPrice;
                const meetsMax = maxPrice === null || finalPrice <= maxPrice;
                return meetsMin && meetsMax;
            } );
        }

        // Filter by stock availability
        if ( inStockOnly ) {
            denominations = denominations.filter( d =>
                d.stock > 0 && ( d.isAvailable !== false )
            );
        }

        // Sort by display order, then by price
        denominations.sort( ( a, b ) => {
            const orderA = a.displayOrder || 999;
            const orderB = b.displayOrder || 999;
            if ( orderA !== orderB ) return orderA - orderB;
            return ( a.discountPrice || a.price ) - ( b.discountPrice || b.price );
        } );

        // Calculate available regions statistics
        const availableRegions = {};
        const allDenominations = regionalPricing.filter( d =>
            ( d.isAvailable !== false ) && d.stock > 0
        );

        allDenominations.forEach( d => {
            if ( !availableRegions[ d.region ] ) {
                availableRegions[ d.region ] = {
                    currency: d.currency,
                    count: 0,
                    totalStock: 0
                };
            }
            availableRegions[ d.region ].count++;
            availableRegions[ d.region ].totalStock += d.stock;
        } );

        // Calculate price statistics
        const priceStats = {
            minPrice: 0,
            maxPrice: 0,
            avgPrice: 0,
            totalStock: 0
        };

        if ( denominations.length > 0 ) {
            const prices = denominations.map( d => d.discountPrice || d.price );
            priceStats.minPrice = Math.min( ...prices );
            priceStats.maxPrice = Math.max( ...prices );
            priceStats.avgPrice = prices.reduce( ( sum, price ) => sum + price, 0 ) / prices.length;
            priceStats.totalStock = denominations.reduce( ( sum, d ) => sum + d.stock, 0 );
        }

        return jsonResponse( {
            success: true,
            data: {
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    category: product.category,
                    images: product.images ? JSON.parse( product.images ) : []
                },
                denominations,
                availableRegions,
                priceStats,
                totalDenominations: regionalPricing.length,
                activeDenominations: denominations.length
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get product denominations error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get product denominations'
        }, 500, corsHeaders );
    }
}

// Create new product
async function handleCreateProduct( request, env, corsHeaders ) {
    try {
        const productData = await request.json();

        // Validation
        if ( !productData.name || !productData.description || !productData.category ) {
            return jsonResponse( {
                success: false,
                error: 'Name, description, and category are required'
            }, 400, corsHeaders );
        }

        // Generate slug from name
        const slug = generateSlug( productData.name );

        // Check if product with same slug exists
        const existingProduct = await env.DB.prepare(
            'SELECT id FROM products WHERE slug = ?'
        ).bind( slug ).first();

        if ( existingProduct ) {
            return jsonResponse( {
                success: false,
                error: 'Product with this name already exists'
            }, 400, corsHeaders );
        }

        // Prepare data for insertion
        const images = JSON.stringify( productData.images || [] );
        const tags = JSON.stringify( productData.tags || [] );
        const regionalPricing = JSON.stringify( productData.regionalPricing || [] );

        const result = await env.DB.prepare( `
      INSERT INTO products (name, slug, description, category, type, is_featured, images, tags, regional_pricing)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
            productData.name,
            slug,
            productData.description,
            productData.category,
            productData.type || 'digital_code',
            productData.isFeatured ? 1 : 0,
            images,
            tags,
            regionalPricing
        ).run();

        if ( result.success ) {
            const newProduct = await env.DB.prepare(
                'SELECT * FROM products WHERE id = ?'
            ).bind( result.meta.last_row_id ).first();

            const formattedProduct = {
                ...newProduct,
                images: newProduct.images ? JSON.parse( newProduct.images ) : [],
                tags: newProduct.tags ? JSON.parse( newProduct.tags ) : [],
                regionalPricing: newProduct.regional_pricing ? JSON.parse( newProduct.regional_pricing ) : []
            };

            return jsonResponse( {
                success: true,
                data: formattedProduct,
                message: 'Product created successfully'
            }, 201, corsHeaders );
        } else {
            throw new Error( 'Failed to create product' );
        }
    } catch ( error ) {
        console.error( 'Create product error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to create product'
        }, 500, corsHeaders );
    }
}

// Update product
async function handleUpdateProduct( request, env, corsHeaders, id ) {
    try {
        const productData = await request.json();

        // Check if product exists
        const existingProduct = await env.DB.prepare(
            'SELECT id FROM products WHERE id = ? AND is_active = 1'
        ).bind( id ).first();

        if ( !existingProduct ) {
            return jsonResponse( {
                success: false,
                error: 'Product not found'
            }, 404, corsHeaders );
        }

        // Prepare update fields
        const updateFields = [];
        const params = [];

        if ( productData.name ) {
            updateFields.push( 'name = ?' );
            params.push( productData.name );
        }

        if ( productData.description ) {
            updateFields.push( 'description = ?' );
            params.push( productData.description );
        }

        if ( productData.category ) {
            updateFields.push( 'category = ?' );
            params.push( productData.category );
        }

        if ( productData.type ) {
            updateFields.push( 'type = ?' );
            params.push( productData.type );
        }

        if ( productData.isFeatured !== undefined ) {
            updateFields.push( 'is_featured = ?' );
            params.push( productData.isFeatured ? 1 : 0 );
        }

        if ( productData.images ) {
            updateFields.push( 'images = ?' );
            params.push( JSON.stringify( productData.images ) );
        }

        if ( productData.tags ) {
            updateFields.push( 'tags = ?' );
            params.push( JSON.stringify( productData.tags ) );
        }

        if ( productData.regionalPricing ) {
            updateFields.push( 'regional_pricing = ?' );
            params.push( JSON.stringify( productData.regionalPricing ) );
        }

        updateFields.push( 'updated_at = ?' );
        params.push( new Date().toISOString() );

        params.push( id );

        const result = await env.DB.prepare( `
      UPDATE products 
      SET ${ updateFields.join( ', ' ) }
      WHERE id = ?
    `).bind( ...params ).run();

        if ( result.success ) {
            const updatedProduct = await env.DB.prepare(
                'SELECT * FROM products WHERE id = ?'
            ).bind( id ).first();

            const formattedProduct = {
                ...updatedProduct,
                images: updatedProduct.images ? JSON.parse( updatedProduct.images ) : [],
                tags: updatedProduct.tags ? JSON.parse( updatedProduct.tags ) : [],
                regionalPricing: updatedProduct.regional_pricing ? JSON.parse( updatedProduct.regional_pricing ) : []
            };

            return jsonResponse( {
                success: true,
                data: formattedProduct,
                message: 'Product updated successfully'
            }, 200, corsHeaders );
        } else {
            throw new Error( 'Failed to update product' );
        }
    } catch ( error ) {
        console.error( 'Update product error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to update product'
        }, 500, corsHeaders );
    }
}

// Delete product (soft delete)
async function handleDeleteProduct( request, env, corsHeaders, id ) {
    try {
        const result = await env.DB.prepare( `
      UPDATE products 
      SET is_active = 0, updated_at = ?
      WHERE id = ?
    `).bind( new Date().toISOString(), id ).run();

        if ( result.success && result.meta.changes > 0 ) {
            return jsonResponse( {
                success: true,
                message: 'Product deleted successfully'
            }, 200, corsHeaders );
        } else {
            return jsonResponse( {
                success: false,
                error: 'Product not found'
            }, 404, corsHeaders );
        }
    } catch ( error ) {
        console.error( 'Delete product error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to delete product'
        }, 500, corsHeaders );
    }
}

// Update product stock
async function handleUpdateStock( request, env, corsHeaders, id ) {
    try {
        const { quantity, operation, region } = await request.json();

        // Get current product
        const product = await env.DB.prepare(
            'SELECT * FROM products WHERE id = ? AND is_active = 1'
        ).bind( id ).first();

        if ( !product ) {
            return jsonResponse( {
                success: false,
                error: 'Product not found'
            }, 404, corsHeaders );
        }

        const regionalPricing = product.regional_pricing ? JSON.parse( product.regional_pricing ) : [];
        const regionIndex = regionalPricing.findIndex( rp => rp.region === region );

        if ( regionIndex === -1 ) {
            return jsonResponse( {
                success: false,
                error: 'Regional pricing not found'
            }, 404, corsHeaders );
        }

        // Update stock
        if ( operation === 'add' ) {
            regionalPricing[ regionIndex ].stock += quantity;
        } else if ( operation === 'subtract' ) {
            regionalPricing[ regionIndex ].stock = Math.max( 0, regionalPricing[ regionIndex ].stock - quantity );
        } else if ( operation === 'set' ) {
            regionalPricing[ regionIndex ].stock = quantity;
        }

        // Update product
        const result = await env.DB.prepare( `
      UPDATE products 
      SET regional_pricing = ?, updated_at = ?
      WHERE id = ?
    `).bind( JSON.stringify( regionalPricing ), new Date().toISOString(), id ).run();

        if ( result.success ) {
            const updatedProduct = await env.DB.prepare(
                'SELECT * FROM products WHERE id = ?'
            ).bind( id ).first();

            const formattedProduct = {
                ...updatedProduct,
                images: updatedProduct.images ? JSON.parse( updatedProduct.images ) : [],
                tags: updatedProduct.tags ? JSON.parse( updatedProduct.tags ) : [],
                regionalPricing: updatedProduct.regional_pricing ? JSON.parse( updatedProduct.regional_pricing ) : []
            };

            return jsonResponse( {
                success: true,
                data: formattedProduct,
                message: 'Stock updated successfully'
            }, 200, corsHeaders );
        } else {
            throw new Error( 'Failed to update stock' );
        }
    } catch ( error ) {
        console.error( 'Update stock error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to update stock'
        }, 500, corsHeaders );
    }
}

// Helper functions
function jsonResponse( data, status = 200, corsHeaders = {} ) {
    return new Response( JSON.stringify( data, null, 2 ), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    } );
}

function generateSlug( name ) {
    return name
        .toLowerCase()
        .replace( /[^a-z0-9]+/g, '-' )
        .replace( /^-+/g, '' )
        .replace( /-+$/g, '' )
        .substring( 0, 50 );
}
