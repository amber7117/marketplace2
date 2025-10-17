const mongoose = require( 'mongoose' );

const productSchema = new mongoose.Schema( {
    _id: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    name: {
        en: { type: String, required: true },
        zh: { type: String },
        th: { type: String },
        my: { type: String },
        vi: { type: String }
    },
    description: {
        en: { type: String, required: true },
        zh: { type: String },
        th: { type: String },
        my: { type: String },
        vi: { type: String }
    },
    sku: { type: String, required: true },
    category: { type: String, required: true },
    categoryName: { type: String }, // 新增：用于面额显示
    type: {
        type: String,
        enum: [ 'game_card', 'gift_card', 'digital_code' ],
        required: true
    },
    images: [ { type: String } ],

    // 更新的区域定价结构（支持面额）
    regionalPricing: [ {
        region: {
            type: String,
            enum: [ 'US', 'MY', 'TH', 'VN', 'PH', 'SG', 'ID', 'GLOBAL' ],
            required: true
        },
        currency: {
            type: String,
            enum: [ 'USD', 'MYR', 'THB', 'VND', 'PHP', 'SGD' ],
            required: true
        },
        denomination: { type: String, required: true }, // 面额标题，如 '$10 USD', 'RM 50'
        price: { type: Number, required: true }, // 售价
        discountPrice: { type: Number }, // 原价（划线价）
        stock: { type: Number, default: 0 }, // 库存
        isAvailable: { type: Boolean, default: true }, // 是否可售
        isInstantDelivery: { type: Boolean, default: true }, // 是否即时发货
        platformLogo: String, // 平台logo路径
        displayOrder: { type: Number, default: 0 }, // 显示顺序
    } ],

    // 新增：面额数据结构（用于 DenominationList 组件）
    regionPrices: [ {
        region: { type: String, required: true }, // 如 'US', 'MY', 'SG'
        currency: { type: String, required: true }, // 如 'USD', 'MYR', 'SGD'
        denomination: { type: String, required: true }, // 面额标题，如 '$10 USD', 'RM 50'
        price: { type: Number, required: true }, // 售价
        originalPrice: { type: Number }, // 原价（划线价）
        stock: { type: Number, default: 0 }, // 库存
        isInstantDelivery: { type: Boolean, default: true }, // 是否即时发货
        isActive: { type: Boolean, default: true }, // 是否可售
        platformLogo: String, // 平台logo路径
        displayOrder: { type: Number, default: 0 }, // 显示顺序
    } ],

    tags: [ { type: String } ],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
} );

// Virtual for final price (using first regional pricing)
productSchema.virtual( 'finalPrice' ).get( function () {
    if ( this.regionalPricing && this.regionalPricing.length > 0 ) {
        const pricing = this.regionalPricing[ 0 ];
        return pricing.discountPrice || pricing.price;
    }
    return 0;
} );

// Virtual for stock status
productSchema.virtual( 'stockStatus' ).get( function () {
    if ( this.regionalPricing && this.regionalPricing.length > 0 ) {
        const totalStock = this.regionalPricing.reduce( ( sum, rp ) => sum + rp.stock, 0 );
        if ( totalStock === 0 ) return 'out_of_stock';
        if ( totalStock <= 10 ) return 'low_stock';
        return 'in_stock';
    }
    return 'out_of_stock';
} );

// Generate slug before saving
productSchema.pre( 'save', function ( next ) {
    if ( this.isModified( 'name' ) && this.name.en ) {
        this.slug = this.name.en
            .toLowerCase()
            .replace( /[^a-z0-9]+/g, '-' )
            .replace( /(^-|-$)/g, '' );
    }
    next();
} );

// Indexes for better query performance
productSchema.index( { category: 1, isActive: 1 } );
productSchema.index( { 'regionalPricing.price': 1 } );
productSchema.index( { isActive: 1, isFeatured: 1 } );
productSchema.index( { tags: 1 } );
productSchema.index( { 'name.en': 'text', 'description.en': 'text', tags: 'text' } );

module.exports = mongoose.model( 'Product', productSchema );
