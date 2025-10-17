const express = require( 'express' );
const router = express.Router();
const { body } = require( 'express-validator' );
const {
    getProducts,
    getProduct,
    getProductDenominations,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getFeaturedProducts
} = require( '../controllers/productController' );
const { getProductWithVariants } = require( '../controllers/variantController' );

// Re-export variant routes
const variantRouter = require( './variantRoutes' );

// Validation rules
const productValidation = [
    body( 'name' ).notEmpty().withMessage( 'Product name is required' ),
    body( 'description' ).notEmpty().withMessage( 'Description is required' ),
    body( 'category' ).notEmpty().withMessage( 'Category is required' ),
    body( 'pricing.basePrice' ).isFloat( { min: 0 } ).withMessage( 'Valid base price is required' ),
    body( 'pricing.currency' ).optional().isIn( [ 'USD', 'MYR', 'THB', 'VND', 'PHP', 'SGD', 'EUR' ] )
];

// Public routes
router.get( '/featured', getFeaturedProducts );
router.get( '/', getProducts );
router.get( '/:identifier/with-variants', getProductWithVariants );
router.get( '/:identifier/denominations', getProductDenominations ); // 新增面额数据路由
router.get( '/:identifier', getProduct );

// Variant routes are temporarily disabled to fix routing conflicts
// router.use( '/product/:productId/variants', variantRouter );

// Protected routes (require admin authentication - to be added in API Gateway)
router.post( '/', productValidation, createProduct );
router.put( '/:id', productValidation, updateProduct );
router.delete( '/:id', deleteProduct );
router.patch( '/:id/stock', updateStock );

module.exports = router;
