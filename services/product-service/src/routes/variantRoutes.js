const express = require( 'express' );
const router = express.Router( { mergeParams: true } );
const {
    getProductVariants,
    getVariant,
    createVariant,
    updateVariant,
    deleteVariant,
    bulkCreateVariants
} = require( '../controllers/variantController' );

// Public routes
router.get( '/', getProductVariants );
router.get( '/:id', getVariant );

// Admin routes (add authentication middleware when ready)
router.post( '/', createVariant );
router.post( '/bulk', bulkCreateVariants );
router.put( '/:id', updateVariant );
router.delete( '/:id', deleteVariant );

module.exports = router;
