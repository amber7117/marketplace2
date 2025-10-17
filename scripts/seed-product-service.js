// 产品服务专用数据库初始化脚本
// 使用方法: node scripts/seed-product-service.js

require( 'dotenv' ).config( { path: '../.env' } );
const mongoose = require( 'mongoose' );

// MongoDB 连接
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://client2:5252Meimei@cluster0.bkbwpfb.mongodb.net/marketplace';

// 产品服务模型定义
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
    type: {
        type: String,
        enum: [ 'game_card', 'gift_card', 'digital_code' ],
        required: true
    },
    images: [ { type: String } ],
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
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        stock: { type: Number, default: 0 },
        isAvailable: { type: Boolean, default: true }
    } ],
    tags: [ { type: String } ],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
} );

const Product = mongoose.model( 'Product', productSchema );

// 测试数据 - 匹配产品服务模型结构
const products = [
    // Game Credits
    {
        _id: 'ml-100-diamonds',
        slug: 'mobile-legends-100-diamonds',
        name: {
            en: 'Mobile Legends Diamonds (100)',
            zh: 'Mobile Legends 钻石 (100)',
            th: 'Mobile Legends เพชร (100)',
            vi: 'Mobile Legends Kim Cương (100)'
        },
        description: {
            en: '100 Mobile Legends Diamonds - Instant Delivery. Valid for all regions. Safe and secure transaction.',
            zh: '100 Mobile Legends 钻石 - 即时交付。适用于所有地区。安全可靠的交易。',
            th: '100 เพชร Mobile Legends - จัดส่งทันที ใช้ได้ทุกภูมิภาค ธุรกรรมที่ปลอดภัยและเชื่อถือได้',
            vi: '100 Kim Cương Mobile Legends - Giao hàng ngay lập tức. Hợp lệ cho tất cả các khu vực. Giao dịch an toàn và bảo mật.'
        },
        sku: 'ML-100-DIA',
        category: 'game_card',
        type: 'game_card',
        images: [
            'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
            'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
        ],
        regionalPricing: [
            {
                region: 'GLOBAL',
                currency: 'USD',
                price: 3.99,
                discountPrice: 2.99,
                stock: 1000,
                isAvailable: true
            },
            {
                region: 'MY',
                currency: 'MYR',
                price: 18.50,
                discountPrice: 13.90,
                stock: 500,
                isAvailable: true
            },
            {
                region: 'TH',
                currency: 'THB',
                price: 145,
                discountPrice: 109,
                stock: 300,
                isAvailable: true
            }
        ],
        tags: [ 'mobile-legends', 'diamonds', 'moonton', 'moba' ],
        isFeatured: true,
        isActive: true
    },
    {
        _id: 'pubg-60-uc',
        slug: 'pubg-mobile-60-uc',
        name: {
            en: 'PUBG Mobile UC (60+6)',
            zh: 'PUBG Mobile UC (60+6)',
            th: 'PUBG Mobile UC (60+6)',
            vi: 'PUBG Mobile UC (60+6)'
        },
        description: {
            en: '60+6 PUBG Mobile UC - Fast delivery within minutes. Purchase with confidence.',
            zh: '60+6 PUBG Mobile UC - 几分钟内快速交付。放心购买。',
            th: '60+6 PUBG Mobile UC - จัดส่งเร็วภายในไม่กี่นาที ซื้อด้วยความมั่นใจ',
            vi: '60+6 PUBG Mobile UC - Giao hàng nhanh trong vài phút. Mua hàng với sự tự tin.'
        },
        sku: 'PUBG-60-UC',
        category: 'game_card',
        type: 'game_card',
        images: [
            'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
            'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
        ],
        regionalPricing: [
            {
                region: 'GLOBAL',
                currency: 'USD',
                price: 1.29,
                discountPrice: 0.99,
                stock: 5000,
                isAvailable: true
            },
            {
                region: 'MY',
                currency: 'MYR',
                price: 6.00,
                discountPrice: 4.60,
                stock: 2000,
                isAvailable: true
            }
        ],
        tags: [ 'pubg', 'uc', 'battle-royale', 'tencent' ],
        isFeatured: true,
        isActive: true
    },
    {
        _id: 'genshin-980-crystals',
        slug: 'genshin-impact-980-crystals',
        name: {
            en: 'Genshin Impact Genesis Crystals (980)',
            zh: '原神创世结晶 (980)',
            th: 'Genshin Impact Genesis Crystals (980)',
            vi: 'Genshin Impact Genesis Crystals (980)'
        },
        description: {
            en: '980 Genesis Crystals for Genshin Impact. Instant top-up for all servers.',
            zh: '980 原神创世结晶。所有服务器即时充值。',
            th: '980 Genesis Crystals สำหรับ Genshin Impact เติมเงินทันทีสำหรับเซิร์ฟเวอร์ทั้งหมด',
            vi: '980 Genesis Crystals cho Genshin Impact. Nạp tiền ngay lập tức cho tất cả máy chủ.'
        },
        sku: 'GI-980-GC',
        category: 'game_card',
        type: 'game_card',
        images: [
            'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
            'https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=800',
        ],
        regionalPricing: [
            {
                region: 'GLOBAL',
                currency: 'USD',
                price: 16.99,
                discountPrice: 14.99,
                stock: 800,
                isAvailable: true
            }
        ],
        tags: [ 'genshin-impact', 'genesis-crystals', 'mihoyo', 'rpg' ],
        isFeatured: true,
        isActive: true
    },
    // Gift Cards
    {
        _id: 'steam-10-usd',
        slug: 'steam-gift-card-10-usd',
        name: {
            en: 'Steam Gift Card $10 (US)',
            zh: 'Steam 礼品卡 $10 (美国)',
            th: 'บัตรของขวัญ Steam $10 (สหรัฐอเมริกา)',
            vi: 'Thẻ quà tặng Steam $10 (Mỹ)'
        },
        description: {
            en: 'Steam $10 Gift Card (US Region). Redeem for games, software, and more on Steam.',
            zh: 'Steam $10 礼品卡（美国地区）。在 Steam 上兑换游戏、软件等。',
            th: 'บัตรของขวัญ Steam $10 (ภูมิภาคสหรัฐอเมริกา) แลกสำหรับเกม ซอฟต์แวร์ และอื่นๆ บน Steam',
            vi: 'Thẻ quà tặng Steam $10 (Khu vực Mỹ). Đổi lấy trò chơi, phần mềm và hơn thế nữa trên Steam.'
        },
        sku: 'STEAM-10-USD',
        category: 'gift_card',
        type: 'gift_card',
        images: [
            'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800',
        ],
        regionalPricing: [
            {
                region: 'US',
                currency: 'USD',
                price: 11.00,
                discountPrice: 10.50,
                stock: 500,
                isAvailable: true
            }
        ],
        tags: [ 'steam', 'gift-card', 'valve', 'gaming' ],
        isFeatured: true,
        isActive: true
    },
    {
        _id: 'google-play-25',
        slug: 'google-play-gift-card-25',
        name: {
            en: 'Google Play Gift Card $25',
            zh: 'Google Play 礼品卡 $25',
            th: 'บัตรของขวัญ Google Play $25',
            vi: 'Thẻ quà tặng Google Play $25'
        },
        description: {
            en: '$25 Google Play Gift Card. Purchase apps, games, music, and more on Google Play.',
            zh: '$25 Google Play 礼品卡。在 Google Play 上购买应用、游戏、音乐等。',
            th: 'บัตรของขวัญ Google Play $25 ซื้อแอป เกม เพลง และอื่นๆ บน Google Play',
            vi: 'Thẻ quà tặng Google Play $25. Mua ứng dụng, trò chơi, nhạc và hơn thế nữa trên Google Play.'
        },
        sku: 'GP-25-USD',
        category: 'gift_card',
        type: 'gift_card',
        images: [
            'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800',
        ],
        regionalPricing: [
            {
                region: 'GLOBAL',
                currency: 'USD',
                price: 26.00,
                discountPrice: 25.00,
                stock: 600,
                isAvailable: true
            }
        ],
        tags: [ 'google-play', 'gift-card', 'android', 'apps' ],
        isFeatured: true,
        isActive: true
    },
    // Mobile Top-up
    {
        _id: 'malaysia-topup-30',
        slug: 'malaysia-topup-rm30',
        name: {
            en: 'Malaysia Mobile Top-up (RM30)',
            zh: '马来西亚手机充值 (RM30)',
            th: 'เติมเงินมือถือมาเลเซีย (RM30)',
            vi: 'Nạp tiền điện thoại Malaysia (RM30)'
        },
        description: {
            en: 'Malaysia prepaid mobile top-up RM30. Support all major operators.',
            zh: '马来西亚预付费手机充值 RM30。支持所有主要运营商。',
            th: 'เติมเงินมือถือแบบเติมเงินมาเลเซีย RM30 รองรับผู้ให้บริการหลักทั้งหมด',
            vi: 'Nạp tiền điện thoại trả trước Malaysia RM30. Hỗ trợ tất cả các nhà mạng chính.'
        },
        sku: 'MY-TOPUP-30',
        category: 'digital_code',
        type: 'digital_code',
        images: [
            'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800',
        ],
        regionalPricing: [
            {
                region: 'MY',
                currency: 'MYR',
                price: 30.00,
                discountPrice: 30.00,
                stock: 999,
                isAvailable: true
            }
        ],
        tags: [ 'malaysia', 'topup', 'prepaid', 'mobile' ],
        isFeatured: false,
        isActive: true
    },
    {
        _id: 'thailand-topup-100',
        slug: 'thailand-topup-100',
        name: {
            en: 'Thailand Mobile Top-up (100 THB)',
            zh: '泰国手机充值 (100 泰铢)',
            th: 'เติมเงินมือถือไทย (100 บาท)',
            vi: 'Nạp tiền điện thoại Thái Lan (100 THB)'
        },
        description: {
            en: 'Thailand prepaid reload 100 Baht. AIS, DTAC, TrueMove supported.',
            zh: '泰国预付费充值 100 泰铢。支持 AIS、DTAC、TrueMove。',
            th: 'เติมเงินมือถือแบบเติมเงินไทย 100 บาท รองรับ AIS, DTAC, TrueMove',
            vi: 'Nạp tiền điện thoại trả trước Thái Lan 100 Baht. Hỗ trợ AIS, DTAC, TrueMove.'
        },
        sku: 'TH-TOPUP-100',
        category: 'digital_code',
        type: 'digital_code',
        images: [
            'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        ],
        regionalPricing: [
            {
                region: 'TH',
                currency: 'THB',
                price: 100.00,
                discountPrice: 100.00,
                stock: 999,
                isAvailable: true
            }
        ],
        tags: [ 'thailand', 'topup', 'prepaid', 'ais', 'dtac' ],
        isFeatured: false,
        isActive: true
    }
];

// 主函数
async function seedDatabase() {
    try {
        console.log( '🔌 连接到 MongoDB...' );
        await mongoose.connect( MONGO_URI );
        console.log( '✅ MongoDB 已连接' );

        // 清空现有数据
        console.log( '\n🗑️  清空现有数据...' );
        await Product.deleteMany( {} );
        console.log( '✅ 产品数据已清空' );

        // 插入产品
        console.log( '\n📦 插入产品数据...' );
        const insertedProducts = await Product.insertMany( products );
        console.log( `✅ 已插入 ${ insertedProducts.length } 个产品` );

        // 统计信息
        console.log( '\n📊 数据库统计:' );
        console.log( `   产品总数: ${ insertedProducts.length }` );
        console.log( `   特色产品: ${ insertedProducts.filter( p => p.isFeatured ).length }` );

        const totalStock = insertedProducts.reduce( ( sum, product ) => {
            return sum + product.regionalPricing.reduce( ( stockSum, rp ) => stockSum + rp.stock, 0 );
        }, 0 );
        console.log( `   总库存量: ${ totalStock }` );

        console.log( '\n🎉 产品服务数据导入成功！' );
        console.log( '\n🔥 热门产品:' );
        insertedProducts
            .filter( p => p.isFeatured )
            .forEach( p => {
                const price = p.regionalPricing[ 0 ]?.discountPrice || p.regionalPricing[ 0 ]?.price || 0;
                console.log( `   • ${ p.name.en } - $${ price }` );
            } );

        console.log( '\n🌍 多语言支持:' );
        insertedProducts.forEach( p => {
            const languages = Object.keys( p.name ).filter( lang => p.name[ lang ] ).length;
            console.log( `   • ${ p.name.en } - ${ languages } 种语言` );
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
