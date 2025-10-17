const Product = require( '../models/Product' );
const ProductVariant = require( '../models/ProductVariant' );
const asyncHandler = require( '../middleware/asyncHandler' );

/**
 * @desc    Get all variants for a product
 * @route   GET /api/products/:productId/variants
 * @access  Public
 */
exports.getProductVariants = asyncHandler( async ( req, res ) => {
    const { productId } = req.params;
    const { region } = req.query;

    const query = {
        product: productId,
        isActive: true
    };

    if ( region ) {
        query.region = region.toUpperCase();
    }

    const variants = await ProductVariant.find( query )
        .sort( { sortOrder: 1, 'pricing.price': 1 } )
        .lean();

    res.status( 200 ).json( {
        success: true,
        count: variants.length,
        data: variants
    } );
} );

/**
 * @desc    Get variant by ID
 * @route   GET /api/products/variants/:id
 * @access  Public
 */
exports.getVariant = asyncHandler( async ( req, res ) => {
    const variant = await ProductVariant.findById( req.params.id )
        .populate( 'product', 'name slug images' )
        .lean();

    if ( !variant ) {
        return res.status( 404 ).json( {
            success: false,
            error: 'Variant not found'
        } );
    }

    res.status( 200 ).json( {
        success: true,
        data: variant
    } );
} );

/**
 * @desc    Create product variant
 * @route   POST /api/products/:productId/variants
 * @access  Private/Admin
 */
exports.createVariant = asyncHandler( async ( req, res ) => {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findById( productId );
    if ( !product ) {
        return res.status( 404 ).json( {
            success: false,
            error: 'Product not found'
        } );
    }

    // Add product reference
    req.body.product = productId;

    // Generate SKU if not provided
    if ( !req.body.sku ) {
        const region = req.body.region || 'GLOBAL';
        const faceValue = req.body.faceValue;
        req.body.sku = `${ product.slug }-${ region }-${ faceValue }-${ Date.now() }`.toUpperCase();
    }

    const variant = await ProductVariant.create( req.body );

    res.status( 201 ).json( {
        success: true,
        data: variant
    } );
} );

/**
 * @desc    Update variant
 * @route   PUT /api/products/variants/:id
 * @access  Private/Admin
 */
exports.updateVariant = asyncHandler( async ( req, res ) => {
    let variant = await ProductVariant.findById( req.params.id );

    if ( !variant ) {
        return res.status( 404 ).json( {
            success: false,
            error: 'Variant not found'
        } );
    }

    // Don't allow changing product reference
    delete req.body.product;

    variant = await ProductVariant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    res.status( 200 ).json( {
        success: true,
        data: variant
    } );
} );

/**
 * @desc    Delete variant
 * @route   DELETE /api/products/variants/:id
 * @access  Private/Admin
 */
exports.deleteVariant = asyncHandler( async ( req, res ) => {
    const variant = await ProductVariant.findById( req.params.id );

    if ( !variant ) {
        return res.status( 404 ).json( {
            success: false,
            error: 'Variant not found'
        } );
    }

    await variant.deleteOne();

    res.status( 200 ).json( {
        success: true,
        data: {}
    } );
} );

/**
 * @desc    Bulk create variants
 * @route   POST /api/products/:productId/variants/bulk
 * @access  Private/Admin
 */
exports.bulkCreateVariants = asyncHandler( async ( req, res ) => {
    const { productId } = req.params;
    const { variants } = req.body;

    // Check if product exists
    const product = await Product.findById( productId );
    if ( !product ) {
        return res.status( 404 ).json( {
            success: false,
            error: 'Product not found'
        } );
    }

    // Add product reference and generate SKU for each variant
    const variantsToCreate = variants.map( ( variant, index ) => {
        const region = variant.region || 'GLOBAL';
        const faceValue = variant.faceValue;

        return {
            ...variant,
            product: productId,
            sku: variant.sku || `${ product.slug }-${ region }-${ faceValue }-${ Date.now() }-${ index }`.toUpperCase()
        };
    } );

    const createdVariants = await ProductVariant.insertMany( variantsToCreate );

    res.status( 201 ).json( {
        success: true,
        count: createdVariants.length,
        data: createdVariants
    } );
} );

/**
 * @desc    Update product to include variants in response
 * @route   GET /api/products/:slug (with variants)
 * @access  Public
 */
exports.getProductWithVariants = asyncHandler( async ( req, res ) => {
    const { slug } = req.params;
    const { region } = req.query;

    const product = await Product.findOne( { slug, isActive: true } )
        .populate( 'category', 'name slug' )
        .lean();

    if ( !product ) {
        return res.status( 404 ).json( {
            success: false,
            error: 'Product not found'
        } );
    }

    // Get variants
    const variantQuery = {
        product: product._id,
        isActive: true
    };

    if ( region ) {
        variantQuery.region = region.toUpperCase();
    }

    const variants = await ProductVariant.find( variantQuery )
        .sort( { sortOrder: 1, 'pricing.price': 1 } )
        .lean();

    // Attach variants to product
    product.variants = variants;

    res.status( 200 ).json( {
        success: true,
        data: product
    } );
} );
