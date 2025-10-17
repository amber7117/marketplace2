const express = require( 'express' );
const router = express.Router();
const { body } = require( 'express-validator' );
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require( '../controllers/categoryController' );

// Validation rules
const categoryValidation = [
    body( 'name' ).notEmpty().withMessage( 'Category name is required' )
];

// Public routes
router.get( '/', getCategories );
router.get( '/:identifier', getCategory );

// Protected routes (require admin authentication)
router.post( '/', categoryValidation, createCategory );
router.put( '/:id', categoryValidation, updateCategory );
router.delete( '/:id', deleteCategory );

module.exports = router;
