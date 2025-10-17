// 数据库初始化脚本 - 导入测试数据
// 使用方法: node scripts/seed-database.js

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
    price: { type: Number, required: true },
    originalPrice: Number,
    stock: { type: Number, default: 0 },
    images: [ String ],
    thumbnail: String,
    sku: String,
    regions: [ String ],
    features: [ String ],
    tags: [ String ],
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

// 测试数据
const categories = [
    {
        name: 'Game Credits',
        slug: 'game-credits',
        description: '游戏点卡充值，支持全球热门游戏',
        icon: '🎮',
        sortOrder: 1,
    },
    {
        name: 'Gift Cards',
        slug: 'gift-cards',
        description: '各类礼品卡，iTunes、Google Play、Steam等',
        icon: '🎁',
        sortOrder: 2,
    },
    {
        name: 'Mobile Top-up',
        slug: 'mobile-topup',
        description: '手机话费充值，支持多国运营商',
        icon: '📱',
        sortOrder: 3,
    },
    {
        name: 'Streaming Services',
        slug: 'streaming',
        description: '流媒体订阅服务，Netflix、Spotify等',
        icon: '📺',
        sortOrder: 4,
    },
    {
        name: 'Software Keys',
        slug: 'software',
        description: '软件激活码，Office、Windows等',
        icon: '💻',
        sortOrder: 5,
    },
];

const products = [
    // Game Credits
    {
        name: 'Mobile Legends Diamonds (100)',
        slug: 'mobile-legends-100-diamonds',
        description: '100 Mobile Legends Diamonds - Instant Delivery. Valid for all regions. Safe and secure transaction.',
        categoryName: 'Game Credits',
        price: 2.99,
        originalPrice: 3.99,
        stock: 1000,
        images: [
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
            'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        sku: 'ML-100-DIA',
        regions: [ 'Global', 'SEA', 'Asia' ],
        features: [ 'Instant Delivery', 'Auto-Recharge', 'Official Authorized', '24/7 Support' ],
        tags: [ 'mobile-legends', 'diamonds', 'moonton', 'moba' ],
        isFeatured: true,
        rating: 4.8,
        reviewCount: 2456,
        soldCount: 15234,
    },
    {
        name: 'PUBG Mobile UC (60+6)',
        slug: 'pubg-mobile-60-uc',
        description: '60+6 PUBG Mobile UC - Fast delivery within minutes. Purchase with confidence.',
        categoryName: 'Game Credits',
        price: 0.99,
        originalPrice: 1.29,
        stock: 5000,
        images: [
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
        sku: 'PUBG-60-UC',
        regions: [ 'Global', 'Asia', 'Europe' ],
        features: [ 'Fast Delivery', 'No VPN Required', 'Safe Transaction', 'Money Back Guarantee' ],
        tags: [ 'pubg', 'uc', 'battle-royale', 'tencent' ],
        isFeatured: true,
        rating: 4.9,
        reviewCount: 8934,
        soldCount: 45678,
    },
    {
        name: 'Genshin Impact Genesis Crystals (980)',
        slug: 'genshin-impact-980-crystals',
        description: '980 Genesis Crystals for Genshin Impact. Instant top-up for all servers.',
        categoryName: 'Game Credits',
        price: 14.99,
        originalPrice: 16.99,
        stock: 800,
        images: [
            'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
            'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400',
        sku: 'GI-980-GC',
        regions: [ 'Global', 'Asia', 'America', 'Europe' ],
        features: [ 'Instant Delivery', 'All Servers', 'Official Reseller', 'Bonus Crystals' ],
        tags: [ 'genshin-impact', 'genesis-crystals', 'mihoyo', 'rpg' ],
        isFeatured: true,
        rating: 4.7,
        reviewCount: 5623,
        soldCount: 28901,
    },
    {
        name: 'Free Fire Diamonds (100)',
        slug: 'free-fire-100-diamonds',
        description: '100 Free Fire Diamonds - Instant recharge for all regions. Safe and reliable.',
        categoryName: 'Game Credits',
        price: 1.49,
        originalPrice: 1.99,
        stock: 3000,
        images: [
            'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=400',
        sku: 'FF-100-DIA',
        regions: [ 'Global', 'SEA', 'LATAM' ],
        features: [ 'Auto Delivery', 'No ID Required', 'Fast Process', 'Customer Support' ],
        tags: [ 'free-fire', 'diamonds', 'garena', 'battle-royale' ],
        rating: 4.6,
        reviewCount: 3421,
        soldCount: 19876,
    },

    // Gift Cards
    {
        name: 'Steam Gift Card $10 (US)',
        slug: 'steam-gift-card-10-usd',
        description: 'Steam $10 Gift Card (US Region). Redeem for games, software, and more on Steam.',
        categoryName: 'Gift Cards',
        price: 10.50,
        originalPrice: 11.00,
        stock: 500,
        images: [
            'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400',
        sku: 'STEAM-10-USD',
        regions: [ 'United States' ],
        features: [ 'Digital Code', 'Instant Email', 'No Expiration', 'Official Valve Partner' ],
        tags: [ 'steam', 'gift-card', 'valve', 'gaming' ],
        isFeatured: true,
        rating: 4.9,
        reviewCount: 12456,
        soldCount: 67890,
    },
    {
        name: 'Google Play Gift Card $25',
        slug: 'google-play-gift-card-25',
        description: '$25 Google Play Gift Card. Purchase apps, games, music, and more on Google Play.',
        categoryName: 'Gift Cards',
        price: 25.00,
        originalPrice: 26.00,
        stock: 600,
        images: [
            'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=400',
        sku: 'GP-25-USD',
        regions: [ 'Global', 'US', 'Canada' ],
        features: [ 'Digital Delivery', 'Auto Email', 'No Fees', 'Official Google Partner' ],
        tags: [ 'google-play', 'gift-card', 'android', 'apps' ],
        isFeatured: true,
        rating: 4.8,
        reviewCount: 9876,
        soldCount: 54321,
    },
    {
        name: 'iTunes Gift Card $15',
        slug: 'itunes-gift-card-15',
        description: 'iTunes $15 Gift Card. Buy apps, games, music, movies and more from Apple.',
        categoryName: 'Gift Cards',
        price: 15.00,
        stock: 400,
        images: [
            'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400',
        sku: 'ITUNES-15-USD',
        regions: [ 'United States', 'Canada' ],
        features: [ 'Instant Code', 'Email Delivery', 'Never Expires', 'Apple Authorized' ],
        tags: [ 'itunes', 'apple', 'gift-card', 'app-store' ],
        rating: 4.7,
        reviewCount: 6543,
        soldCount: 38765,
    },
    {
        name: 'PlayStation Network Card $20',
        slug: 'psn-card-20',
        description: 'PSN $20 Card. Add funds to your PlayStation wallet for games and subscriptions.',
        categoryName: 'Gift Cards',
        price: 20.00,
        stock: 350,
        images: [
            'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        sku: 'PSN-20-USD',
        regions: [ 'United States' ],
        features: [ 'Digital Code', 'Instant Delivery', 'No Expiry', 'Sony Official' ],
        tags: [ 'playstation', 'psn', 'sony', 'gaming' ],
        rating: 4.8,
        reviewCount: 7890,
        soldCount: 42109,
    },

    // Mobile Top-up
    {
        name: 'Malaysia Mobile Top-up (RM30)',
        slug: 'malaysia-topup-rm30',
        description: 'Malaysia prepaid mobile top-up RM30. Support all major operators.',
        categoryName: 'Mobile Top-up',
        price: 7.50,
        stock: 999,
        images: [
            'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400',
        sku: 'MY-TOPUP-30',
        regions: [ 'Malaysia' ],
        features: [ 'Instant Reload', 'All Operators', 'No Extra Fees', '24/7 Available' ],
        tags: [ 'malaysia', 'topup', 'prepaid', 'mobile' ],
        rating: 4.9,
        reviewCount: 4321,
        soldCount: 25678,
    },
    {
        name: 'Thailand Mobile Top-up (100 THB)',
        slug: 'thailand-topup-100',
        description: 'Thailand prepaid reload 100 Baht. AIS, DTAC, TrueMove supported.',
        categoryName: 'Mobile Top-up',
        price: 3.00,
        stock: 999,
        images: [
            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400',
        sku: 'TH-TOPUP-100',
        regions: [ 'Thailand' ],
        features: [ 'Fast Reload', 'Major Operators', 'No Fees', 'Instant Credit' ],
        tags: [ 'thailand', 'topup', 'prepaid', 'ais', 'dtac' ],
        rating: 4.7,
        reviewCount: 3210,
        soldCount: 18765,
    },

    // Streaming Services
    {
        name: 'Netflix Premium Gift Card 1 Month',
        slug: 'netflix-premium-1-month',
        description: 'Netflix Premium subscription for 1 month. Watch on up to 4 devices in 4K.',
        categoryName: 'Streaming Services',
        price: 15.99,
        stock: 200,
        images: [
            'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
        sku: 'NETFLIX-PREM-1M',
        regions: [ 'Global' ],
        features: [ '4K Quality', '4 Screens', 'Downloads', 'All Content' ],
        tags: [ 'netflix', 'streaming', 'subscription', '4k' ],
        isFeatured: true,
        rating: 4.9,
        reviewCount: 8765,
        soldCount: 34567,
    },
    {
        name: 'Spotify Premium 3 Months',
        slug: 'spotify-premium-3-months',
        description: 'Spotify Premium for 3 months. Ad-free music, offline downloads, unlimited skips.',
        categoryName: 'Streaming Services',
        price: 29.99,
        stock: 150,
        images: [
            'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400',
        sku: 'SPOTIFY-PREM-3M',
        regions: [ 'Global' ],
        features: [ 'Ad-Free', 'Offline Mode', 'High Quality', 'Unlimited Skips' ],
        tags: [ 'spotify', 'music', 'streaming', 'premium' ],
        rating: 4.8,
        reviewCount: 6543,
        soldCount: 28901,
    },

    // Software Keys
    {
        name: 'Microsoft Office 365 Personal 1 Year',
        slug: 'office-365-personal-1-year',
        description: 'Microsoft Office 365 Personal subscription for 1 year. Word, Excel, PowerPoint, Outlook and 1TB OneDrive.',
        categoryName: 'Software Keys',
        price: 69.99,
        stock: 100,
        images: [
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        sku: 'OFFICE-365-1Y',
        regions: [ 'Global' ],
        features: [ 'All Apps', '1TB Storage', 'Premium Support', 'Auto Updates' ],
        tags: [ 'microsoft', 'office', 'office365', 'productivity' ],
        isFeatured: true,
        rating: 4.9,
        reviewCount: 5432,
        soldCount: 21098,
    },
    {
        name: 'Windows 11 Pro Product Key',
        slug: 'windows-11-pro-key',
        description: 'Windows 11 Pro genuine product key. Lifetime activation for 1 PC.',
        categoryName: 'Software Keys',
        price: 39.99,
        originalPrice: 199.99,
        stock: 75,
        images: [
            'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400',
        sku: 'WIN11-PRO-KEY',
        regions: [ 'Global' ],
        features: [ 'Lifetime License', 'Instant Delivery', 'Official Key', 'Remote Support' ],
        tags: [ 'windows', 'windows11', 'microsoft', 'os' ],
        rating: 4.7,
        reviewCount: 4321,
        soldCount: 16789,
    },
];

// 主函数
async function seedDatabase() {
    try {
        console.log( '🔌 连接到 MongoDB...' );
        await mongoose.connect( MONGO_URI );
        console.log( '✅ MongoDB 已连接' );

        // 清空现有数据
        console.log( '\n🗑️  清空现有数据...' );
        await Category.deleteMany( {} );
        await Product.deleteMany( {} );
        console.log( '✅ 数据已清空' );

        // 插入分类
        console.log( '\n📁 插入分类数据...' );
        const insertedCategories = await Category.insertMany( categories );
        console.log( `✅ 已插入 ${ insertedCategories.length } 个分类` );

        // 为每个产品关联分类ID
        console.log( '\n📦 准备产品数据...' );
        const productsWithCategory = products.map( product => {
            const category = insertedCategories.find( cat => cat.name === product.categoryName );
            return {
                ...product,
                category: category._id,
            };
        } );

        // 插入产品
        console.log( '📦 插入产品数据...' );
        const insertedProducts = await Product.insertMany( productsWithCategory );
        console.log( `✅ 已插入 ${ insertedProducts.length } 个产品` );

        // 统计信息
        console.log( '\n📊 数据库统计:' );
        console.log( `   分类总数: ${ insertedCategories.length }` );
        console.log( `   产品总数: ${ insertedProducts.length }` );
        console.log( `   特色产品: ${ insertedProducts.filter( p => p.isFeatured ).length }` );
        console.log( `   总库存量: ${ insertedProducts.reduce( ( sum, p ) => sum + p.stock, 0 ) }` );

        console.log( '\n🎉 数据导入成功！' );
        console.log( '\n可用的产品分类:' );
        insertedCategories.forEach( cat => {
            const count = insertedProducts.filter( p => p.category.toString() === cat._id.toString() ).length;
            console.log( `   ${ cat.icon } ${ cat.name } (${ count } 个产品)` );
        } );

        console.log( '\n🔥 热门产品:' );
        insertedProducts
            .filter( p => p.isFeatured )
            .forEach( p => {
                console.log( `   • ${ p.name } - $${ p.price } (库存: ${ p.stock })` );
            } );

    } catch ( error ) {
        console.error( '❌ 错误:', error );
        process.exit( 1 );
    } finally {
        await mongoose.connection.close();
        console.log( '\n👋 数据库连接已关闭' );
        process.exit( 0 );
    }
}

// 运行
seedDatabase();
