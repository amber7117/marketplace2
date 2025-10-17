const Category = require( '../models/Category' );
const { validationResult } = require( 'express-validator' );

// @desc    Get all categories
// @route   GET /categories
// @access  Public
const getCategories = async ( req, res, next ) => {
    try {
        const filter = { isActive: true };

        // Filter by parent category
        if ( req.query.parent ) {
            filter.parentCategory = req.query.parent === 'null' ? null : req.query.parent;
        }

        const categories = await Category.find( filter )
            .populate( 'parentCategory', 'name slug' )
            .populate( 'subcategories' )
            .sort( { sortOrder: 1, name: 1 } )
            .lean();

        res.status( 200 ).json( {
            success: true,
            data: categories
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Get single category
// @route   GET /categories/:identifier
// @access  Public
const getCategory = async ( req, res, next ) => {
    try {
        const { identifier } = req.params;

        // Try to find by slug first, then by ID
        let category = await Category.findOne( { slug: identifier, isActive: true } )
            .populate( 'parentCategory', 'name slug' )
            .populate( 'subcategories' );

        if ( !category && identifier.match( /^[0-9a-fA-F]{24}$/ ) ) {
            category = await Category.findOne( { _id: identifier, isActive: true } )
                .populate( 'parentCategory', 'name slug' )
                .populate( 'subcategories' );
        }

        if ( !category ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Category not found'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            data: category
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Create new category
// @route   POST /categories
// @access  Private/Admin
const createCategory = async ( req, res, next ) => {
    try {
        const errors = validationResult( req );
        if ( !errors.isEmpty() ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Validation failed',
                details: errors.array()
            } );
        }

        const category = await Category.create( req.body );

        res.status( 201 ).json( {
            success: true,
            data: category,
            message: 'Category created successfully'
        } );
    } catch ( error ) {
        if ( error.code === 11000 ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Category with this name already exists'
            } );
        }
        next( error );
    }
};

// @desc    Update category
// @route   PUT /categories/:id
// @access  Private/Admin
const updateCategory = async ( req, res, next ) => {
    try {
        const errors = validationResult( req );
        if ( !errors.isEmpty() ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Validation failed',
                details: errors.array()
            } );
        }

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if ( !category ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Category not found'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            data: category,
            message: 'Category updated successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

// @desc    Delete category (soft delete)
// @route   DELETE /categories/:id
// @access  Private/Admin
const deleteCategory = async ( req, res, next ) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if ( !category ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Category not found'
            } );
        }

        res.status( 200 ).json( {
            success: true,
            message: 'Category deleted successfully'
        } );
    } catch ( error ) {
        next( error );
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
