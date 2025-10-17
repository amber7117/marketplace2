const mongoose = require( 'mongoose' );

const productVariantSchema = new mongoose.Schema( {
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    label: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    faceValue: {
        type: Number,
        required: true,
        min: 0
    },
    region: {
        type: String,
        enum: [ 'MY', 'TH', 'SG', 'PH', 'VN', 'GLOBAL' ],
        default: 'GLOBAL'
    },
    currency: {
        type: String,
        enum: [ 'USD', 'MYR', 'THB', 'VND', 'PHP', 'SGD' ],
        default: 'USD'
    },
    pricing: {
        originalPrice: {
            type: Number,
            required: true,
            min: 0
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        costPrice: {
            type: Number,
            min: 0
        }
    },
    stock: {
        quantity: {
            type: Number,
            default: 0,
            min: 0
        },
        isUnlimited: {
            type: Boolean,
            default: false
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
} );

// 索引
productVariantSchema.index( { product: 1, region: 1 } );
productVariantSchema.index( { sku: 1 } );
productVariantSchema.index( { isActive: 1 } );

// 虚拟字段：折扣百分比
productVariantSchema.virtual( 'discountPercentage' ).get( function () {
    if ( this.pricing.price < this.pricing.originalPrice ) {
        return Math.round( ( ( this.pricing.originalPrice - this.pricing.price ) / this.pricing.originalPrice ) * 100 );
    }
    return 0;
} );

// 虚拟字段：是否有折扣
productVariantSchema.virtual( 'hasDiscount' ).get( function () {
    return this.pricing.price < this.pricing.originalPrice;
} );

// 设置toJSON选项以包含虚拟字段
productVariantSchema.set( 'toJSON', { virtuals: true } );
productVariantSchema.set( 'toObject', { virtuals: true } );

module.exports = mongoose.model( 'ProductVariant', productVariantSchema );
