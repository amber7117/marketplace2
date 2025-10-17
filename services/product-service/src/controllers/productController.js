const Product = require( '../models/Product' );
const { validationResult } = require( 'express-validator' );
const mongoose = require( 'mongoose' );

const buildProductFilter = ( query = {} ) => {
    const filter = { isActive: true };

    [ 'category', 'type' ].forEach( ( field ) => {
        if ( query[ field ] ) {
            filter[ field ] = query[ field ];
        }
    } );

    if ( query.isFeatured !== undefined ) {
        filter.isFeatured = query.isFeatured === 'true';
    }

    if ( query.minPrice || query.maxPrice ) {
        filter[ 'regionalPricing.price' ] = {};
        if ( query.minPrice ) {
            filter[ 'regionalPricing.price' ].$gte = parseFloat( query.minPrice );
        }
        if ( query.maxPrice ) {
            filter[ 'regionalPricing.price' ].$lte = parseFloat( query.maxPrice );
        }
    }

    if ( query.search ) {
        // Use regex search instead of text search since the text index might not be properly configured
        filter.$or = [
            { 'name.en': { $regex: query.search, $options: 'i' } },
            { 'description.en': { $regex: query.search, $options: 'i' } },
            { tags: { $in: [ new RegExp( query.search, 'i' ) ] } }
        ];
    }

    return filter;
};

// @desc    Get all products
// @route   GET /products
// @access  Public
const getProducts = async ( req, res, next ) => {
    try {
        const page = parseInt( req.query.page ) || 1;
        const limit = parseInt( req.query.limit ) || 20;
        const skip = ( page - 1 ) * limit;

        const filter = buildProductFilter( req.query );
        const sortOptions = {
            price_asc: { 'regionalPricing.price': 1 },
            price_desc: { 'regionalPricing.price': -1 },
            popular: { createdAt: -1 },
            rating: { createdAt: -1 }
        };
        const sort = sortOptions[ req.query.sort ] || { createdAt: -1 };

        const products = await Product.find( filter )
            .sort( sort )
            .limit( limit )
            .skip( skip )
            .lean();

        const total = await Product.countDocuments( filter );

        res.status( 200 ).json( {
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil( total / limit )
            }
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get product by ID or slug
// @route   GET /products/:id
// @access  Public
const getProduct = async ( req, res, next ) => {
    try {
        let product;

        // Check if the parameter is a MongoDB ObjectId or a slug
        if ( mongoose.Types.ObjectId.isValid( req.params.id ) ) {
            product = await Product.findById( req.params.id );
        } else {
            // Try to find by slug first, then by _id (for custom string IDs)
            product = await Product.findOne( {
                $or: [
                    { slug: req.params.id },
                    { _id: req.params.id }
                ],
                isActive: true
            } );
        }

        if ( !product ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Product not found'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            data: product
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get product denominations (面额数据)
// @route   GET /products/:id/denominations
// @access  Public
const getProductDenominations = async ( req, res, next ) => {
    try {
        // 直接查询数据库，不依赖特定的模型结构
        const db = mongoose.connection.db;
        let product;

        // 尝试通过 slug 或 _id 查找产品
        console.log( 'Searching for product with identifier:', req.params.identifier );

        if ( mongoose.Types.ObjectId.isValid( req.params.identifier ) ) {
            product = await db.collection( 'products' ).findOne( { _id: req.params.identifier } );
            console.log( 'Searched by ObjectId, found:', !!product );
        } else {
            product = await db.collection( 'products' ).findOne( {
                $or: [
                    { slug: req.params.identifier },
                    { _id: req.params.identifier }
                ],
                isActive: true
            } );
            console.log( 'Searched by slug/id with filter, found:', !!product );

            // 如果没找到，尝试不加 isActive 过滤
            if ( !product ) {
                product = await db.collection( 'products' ).findOne( {
                    $or: [
                        { slug: req.params.identifier },
                        { _id: req.params.identifier }
                    ]
                } );
                console.log( 'Searched by slug/id without filter, found:', !!product );
            }
        }

        if ( !product ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Product not found'
            } );
        }

        // 过滤查询参数
        const { region, currency, inStockOnly = 'false', minPrice, maxPrice } = req.query;

        // 优先使用 regionalPricing，如果不存在则使用 regionPrices（向后兼容）
        let denominations = product.regionalPricing || product.regionPrices || [];        // 按地区过滤
        if ( region ) {
            denominations = denominations.filter( d => d.region === region );
        }

        // 按货币过滤
        if ( currency ) {
            denominations = denominations.filter( d => d.currency === currency );
        }

        // 价格范围过滤
        if ( minPrice || maxPrice ) {
            denominations = denominations.filter( d => {
                // 使用折扣价或原价
                const finalPrice = d.discountPrice || d.price;
                const meetsMin = minPrice ? finalPrice >= parseFloat( minPrice ) : true;
                const meetsMax = maxPrice ? finalPrice <= parseFloat( maxPrice ) : true;
                return meetsMin && meetsMax;
            } );
        }

        // 只显示有库存的
        if ( inStockOnly === 'true' ) {
            denominations = denominations.filter( d => d.stock > 0 && ( d.isAvailable || d.isActive ) );
        }

        // 按显示顺序排序
        denominations = denominations
            .filter( d => d.isAvailable || d.isActive )
            .sort( ( a, b ) => ( a.displayOrder || 0 ) - ( b.displayOrder || 0 ) );

        // 获取可用地区统计
        const availableRegions = {};
        const sourceDenominations = product.regionalPricing || product.regionPrices || [];
        sourceDenominations
            .filter( d => ( d.isAvailable || d.isActive ) && d.stock > 0 )
            .forEach( d => {
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

        // 计算价格统计
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

        res.status( 200 ).json( {
            success: true,
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    slug: product.slug,
                    categoryName: product.categoryName,
                    images: product.images,
                    thumbnail: product.thumbnail
                },
                denominations,
                availableRegions,
                totalDenominations: ( product.regionPrices || [] ).length,
                activeDenominations: denominations.length
            }
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Create new product
// @route   POST /products
// @access  Private/Admin
const createProduct = async ( req, res, next ) => {
    try {
        const errors = validationResult( req );
        if ( !errors.isEmpty() ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Validation failed',
                details: errors.array()
            } );
        }

        const product = await Product.create( req.body );

        res.status( 201 ).json( {
            success: true,
            data: product,
            message: 'Product created successfully'
        } );
    } catch ( error ) {
        if ( error.code === 11000 ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Product with this name already exists'
            } );
        }
        next( error );
    }
};

// @desc    Update product
// @route   PUT /products/:id
// @access  Private/Admin
const updateProduct = async ( req, res, next ) => {
    try {
        const errors = validationResult( req );
        if ( !errors.isEmpty() ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Validation failed',
                details: errors.array()
            } );
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if ( !product ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Product not found'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            data: product,
            message: 'Product updated successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Delete product (soft delete)
// @route   DELETE /products/:id
// @access  Private/Admin
const deleteProduct = async ( req, res, next ) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if ( !product ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Product not found'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            message: 'Product deleted successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Update product stock
// @route   PATCH /products/:id/stock
// @access  Private/Admin
const updateStock = async ( req, res, next ) => {
    try {
        const { quantity, operation, region } = req.body;

        const product = await Product.findById( req.params.id );

        if ( !product ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Product not found'
            } );
        }

        // Find the regional pricing to update
        const regionalPricing = product.regionalPricing.find( rp => rp.region === region );
        if ( !regionalPricing ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Regional pricing not found'
            } );
        }

        if ( operation === 'add' ) {
            regionalPricing.stock += quantity;
        } else if ( operation === 'subtract' ) {
            regionalPricing.stock = Math.max( 0, regionalPricing.stock - quantity );
        } else if ( operation === 'set' ) {
            regionalPricing.stock = quantity;
        }

        await product.save();

        res.status( 200 ).json( {
            success: true,
            data: product,
            message: 'Stock updated successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get featured products
// @route   GET /products/featured
// @access  Public
const getFeaturedProducts = async ( req, res, next ) => {
    try {
        const limit = parseInt( req.query.limit ) || 10;

        const products = await Product.find( { isActive: true, isFeatured: true } )
            .limit( limit )
            .sort( { createdAt: -1 } );

        res.status( 200 ).json( {
            success: true,
            data: products
        } );
    } catch ( error ) {
        next( error );
    }
};

module.exports = {
    getProducts,
    getProduct,
    getProductDenominations,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getFeaturedProducts
};
