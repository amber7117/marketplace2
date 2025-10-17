// PlayStation Gift Card 面额数据种子文件
// 基于 DenominationList 组件的真实数据结构
// 使用方法: node scripts/seed-denomination-data.js

require( 'dotenv' ).config( { path: '../.env' } );
const mongoose = require( 'mongoose' );

// MongoDB 连接
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://client2:5252Meimei@cluster0.bkbwpfb.mongodb.net/marketplace';

// 数据库模型定义
const categorySchema = new mongoose.Schema( {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    icon: String,
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
} );

const productSchema = new mongoose.Schema( {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    categoryName: String,
    price: { type: Number, required: true }, // 默认价格
    originalPrice: Number,
    stock: { type: Number, default: 0 },
    images: [ String ],
    thumbnail: String,
    sku: String,
    regions: [ String ],
    features: [ String ],
    tags: [ String ],

    // 新增：支持多面额的区域价格数据
    regionPrices: [ {
        region: { type: String, required: true }, // 如 'US', 'MY', 'SG' 等
        currency: { type: String, required: true }, // 如 'USD', 'MYR', 'SGD'
        denomination: { type: String, required: true }, // 面额标题，如 '$10 USD', 'RM 50'
        price: { type: Number, required: true }, // 售价
        originalPrice: { type: Number }, // 原价（划线价）
        stock: { type: Number, default: 0 }, // 该面额的库存
        isInstantDelivery: { type: Boolean, default: true }, // 是否即时发货
        isActive: { type: Boolean, default: true }, // 是否可售
        platformLogo: String, // 平台logo路径
        displayOrder: { type: Number, default: 0 }, // 显示顺序
    } ],

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
} );

const Category = mongoose.model( 'Category', categorySchema );
const Product = mongoose.model( 'Product', productSchema );

// PlayStation 分类数据
const playstationCategory = {
    name: 'PlayStation',
    slug: 'playstation',
    description: 'PlayStation Store 礼品卡和游戏点数卡',
    icon: '🎮',
    sortOrder: 1,
};

// PlayStation Gift Card 商品数据（包含多个面额）
const psnGiftCardProduct = {
    name: 'PlayStation Store Gift Card',
    slug: 'playstation-store-gift-card',
    description: 'PlayStation Store 官方礼品卡，可用于购买游戏、DLC、订阅服务等。支持多个地区和面额，即时发货到邮箱。',
    categoryName: 'PlayStation',

    // 基础价格（最低面额作为默认价格）
    price: 9.99,
    originalPrice: 10.99,
    stock: 1000,

    images: [
        '/images/products/psn-card-1.jpg',
        '/images/products/psn-card-2.jpg',
        '/images/products/psn-card-gallery.jpg'
    ],
    thumbnail: '/images/products/psn-card-thumb.jpg',
    sku: 'PSN-GIFT-CARD',
    regions: [ 'US', 'EU', 'UK', 'MY', 'SG', 'TH', 'PH' ],
    features: [
        'Instant Email Delivery',
        'Official PlayStation Store',
        'No Expiration Date',
        '24/7 Customer Support',
        'Secure Transaction'
    ],
    tags: [ 'playstation', 'psn', 'gift-card', 'gaming', 'digital' ],

    // 多面额数据 - 这是 DenominationList 组件的核心数据
    regionPrices: [
        // 美国 USD 面额
        {
            region: 'US',
            currency: 'USD',
            denomination: '$10 USD',
            price: 9.99,
            originalPrice: 10.99,
            stock: 500,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 1,
        },
        {
            region: 'US',
            currency: 'USD',
            denomination: '$20 USD',
            price: 19.49,
            originalPrice: 21.99,
            stock: 300,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 2,
        },
        {
            region: 'US',
            currency: 'USD',
            denomination: '$50 USD',
            price: 47.99,
            originalPrice: 52.99,
            stock: 200,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 3,
        },
        {
            region: 'US',
            currency: 'USD',
            denomination: '$100 USD',
            price: 94.99,
            originalPrice: 104.99,
            stock: 100,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 4,
        },

        // 马来西亚 MYR 面额
        {
            region: 'MY',
            currency: 'MYR',
            denomination: 'RM 50',
            price: 48.50,
            originalPrice: 52.00,
            stock: 150,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 5,
        },
        {
            region: 'MY',
            currency: 'MYR',
            denomination: 'RM 100',
            price: 96.00,
            originalPrice: 105.00,
            stock: 80,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 6,
        },

        // 新加坡 SGD 面额
        {
            region: 'SG',
            currency: 'SGD',
            denomination: '$15 SGD',
            price: 14.25,
            originalPrice: 15.90,
            stock: 120,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 7,
        },
        {
            region: 'SG',
            currency: 'SGD',
            denomination: '$30 SGD',
            price: 28.50,
            originalPrice: 31.50,
            stock: 90,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 8,
        },

        // 缺货示例（泰国）
        {
            region: 'TH',
            currency: 'THB',
            denomination: '฿500 THB',
            price: 475.00,
            originalPrice: 520.00,
            stock: 0, // 缺货
            isInstantDelivery: false,
            isActive: false,
            platformLogo: '/images/platforms/playstation.png',
            displayOrder: 9,
        },
    ],

    isFeatured: true,
    rating: 4.9,
    reviewCount: 2847,
    soldCount: 15432,
};

// 额外的 Xbox Gift Card 示例数据
const xboxGiftCardProduct = {
    name: 'Xbox Gift Card',
    slug: 'xbox-gift-card',
    description: 'Xbox Store 官方礼品卡，用于购买游戏、DLC、Xbox Game Pass 等。',
    categoryName: 'Xbox',
    price: 9.99,
    originalPrice: 10.99,
    stock: 800,
    images: [ '/images/products/xbox-card.jpg' ],
    thumbnail: '/images/products/xbox-card-thumb.jpg',
    sku: 'XBOX-GIFT-CARD',
    regions: [ 'US', 'EU', 'UK' ],
    features: [ 'Instant Delivery', 'Official Xbox Store', 'No Expiry' ],
    tags: [ 'xbox', 'microsoft', 'gift-card', 'gaming' ],

    regionPrices: [
        {
            region: 'US',
            currency: 'USD',
            denomination: '$10 USD',
            price: 9.89,
            originalPrice: 10.99,
            stock: 200,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/xbox.png',
            displayOrder: 1,
        },
        {
            region: 'US',
            currency: 'USD',
            denomination: '$25 USD',
            price: 24.49,
            originalPrice: 26.99,
            stock: 150,
            isInstantDelivery: true,
            isActive: true,
            platformLogo: '/images/platforms/xbox.png',
            displayOrder: 2,
        },
    ],

    isFeatured: false,
    rating: 4.7,
    reviewCount: 892,
    soldCount: 3421,
};

// 数据库操作函数
async function connectDB() {
    try {
        await mongoose.connect( MONGO_URI );
        console.log( '✅ 已连接到 MongoDB Atlas' );
    } catch ( error ) {
        console.error( '❌ MongoDB 连接失败:', error );
        process.exit( 1 );
    }
}

async function clearExistingData() {
    try {
        await Product.deleteMany( { slug: { $in: [ 'playstation-store-gift-card', 'xbox-gift-card' ] } } );
        await Category.deleteMany( { slug: { $in: [ 'playstation', 'xbox' ] } } );
        console.log( '🧹 已清理现有数据' );
    } catch ( error ) {
        console.error( '❌ 清理数据失败:', error );
    }
}

async function seedCategories() {
    try {
        // PlayStation 分类
        const psnCat = new Category( playstationCategory );
        await psnCat.save();

        // Xbox 分类
        const xboxCat = new Category( {
            name: 'Xbox',
            slug: 'xbox',
            description: 'Xbox Store 礼品卡和游戏点数',
            icon: '🎮',
            sortOrder: 2,
        } );
        await xboxCat.save();

        console.log( '📁 已创建游戏平台分类' );
        return { psnCat, xboxCat };
    } catch ( error ) {
        console.error( '❌ 创建分类失败:', error );
        throw error;
    }
}

async function seedProducts( categories ) {
    try {
        // 设置分类 ID
        psnGiftCardProduct.category = categories.psnCat._id;
        xboxGiftCardProduct.category = categories.xboxCat._id;

        // 创建商品
        const psnProduct = new Product( psnGiftCardProduct );
        const xboxProduct = new Product( xboxGiftCardProduct );

        await psnProduct.save();
        await xboxProduct.save();

        console.log( '🎮 已创建游戏礼品卡商品' );
        console.log( `   - PlayStation Store Gift Card (${ psnProduct.regionPrices.length } 个面额)` );
        console.log( `   - Xbox Gift Card (${ xboxProduct.regionPrices.length } 个面额)` );

        return { psnProduct, xboxProduct };
    } catch ( error ) {
        console.error( '❌ 创建商品失败:', error );
        throw error;
    }
}

async function displaySeedResults( products ) {
    console.log( '\n📊 种子数据统计:' );
    console.log( '==================' );

    for ( const product of Object.values( products ) ) {
        console.log( `\n🎯 ${ product.name }:` );
        console.log( `   Slug: ${ product.slug }` );
        console.log( `   基础价格: $${ product.price }` );
        console.log( `   总库存: ${ product.stock }` );
        console.log( `   面额数量: ${ product.regionPrices.length }` );

        console.log( '   面额详情:' );
        product.regionPrices
            .sort( ( a, b ) => a.displayOrder - b.displayOrder )
            .forEach( rp => {
                const status = rp.stock > 0 ? '✅' : '❌';
                const delivery = rp.isInstantDelivery ? '⚡' : '📦';
                console.log( `     ${ status } ${ delivery } ${ rp.denomination } - $${ rp.price } (库存: ${ rp.stock })` );
            } );
    }

    console.log( '\n🚀 数据已成功导入数据库！' );
    console.log( '现在你可以在前端使用这些真实数据来测试 DenominationList 组件。' );
}

// 主执行函数
async function main() {
    console.log( '🌱 开始导入面额选择器数据...\n' );

    try {
        await connectDB();
        await clearExistingData();

        const categories = await seedCategories();
        const products = await seedProducts( categories );

        await displaySeedResults( products );

    } catch ( error ) {
        console.error( '💥 数据导入失败:', error );
    } finally {
        await mongoose.connection.close();
        console.log( '\n🔌 数据库连接已关闭' );
    }
}

// 如果直接运行此脚本
if ( require.main === module ) {
    main();
}

module.exports = {
    connectDB,
    seedCategories,
    seedProducts,
    playstationCategory,
    psnGiftCardProduct,
    xboxGiftCardProduct,
};