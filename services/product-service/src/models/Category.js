const mongoose = require( 'mongoose' );

const categorySchema = new mongoose.Schema( {
    name: {
        type: String,
        required: [ true, 'Category name is required' ],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String
    },
    image: {
        type: String
    },
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
} );

// Virtual for subcategories
categorySchema.virtual( 'subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parentCategory'
} );

// Generate slug before saving
categorySchema.pre( 'save', function ( next ) {
    if ( this.isModified( 'name' ) ) {
        this.slug = this.name
            .toLowerCase()
            .replace( /[^a-z0-9]+/g, '-' )
            .replace( /(^-|-$)/g, '' );
    }
    next();
} );

// Index for faster queries
categorySchema.index( { slug: 1 } );
categorySchema.index( { isActive: 1, sortOrder: 1 } );

module.exports = mongoose.model( 'Category', categorySchema );
