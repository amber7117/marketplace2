#!/usr/bin/env node

/**
 * 完整数据生成和导入脚本
 * 使用方法: node scripts/generate-and-import-data.js
 * 
 * 功能:
 * 1. 生成测试产品数据
 * 2. 导入到产品服务数据库
 * 3. 验证数据导入结果
 */

require( 'dotenv' ).config( { path: '../.env' } );
const mongoose = require( 'mongoose' );
const { faker } = require( '@faker-js/faker' );

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

// 游戏产品数据生成器
function generateGameProducts() {
    const games = [
        {
            name: {
                en: 'Mobile Legends Diamonds',
                zh: 'Mobile Legends 钻石',
                th: 'Mobile Legends เพชร',
                vi: 'Mobile Legends Kim Cương'
            },
            baseName: 'mobile-legends',
            denominations: [ 100, 300, 500, 1000, 2000 ],
            basePrice: 0.03, // 每钻石的价格
            category: 'game_card',
            tags: [ 'mobile-legends', 'diamonds', 'moonton', 'moba' ]
        },
        {
            name: {
                en: 'PUBG Mobile UC',
                zh: 'PUBG Mobile UC',
                th: 'PUBG Mobile UC',
                vi: 'PUBG Mobile UC'
            },
            baseName: 'pubg-mobile',
            denominations: [ 60, 325, 660, 1800, 3850 ],
            basePrice: 0.016,
            category: 'game_card',
            tags: [ 'pubg', 'uc', 'battle-royale', 'tencent' ]
        },
        {
            name: {
                en: 'Genshin Impact Genesis Crystals',
                zh: '原神创世结晶',
                th: 'Genshin Impact Genesis Crystals',
                vi: 'Genshin Impact Genesis Crystals'
            },
            baseName: 'genshin-impact',
            denominations: [ 60, 300, 980, 1980, 3280, 6480 ],
            basePrice: 0.015,
            category: 'game_card',
            tags: [ 'genshin-impact', 'genesis-crystals', 'mihoyo', 'rpg' ]
        },
        {
            name: {
                en: 'Free Fire Diamonds',
                zh: 'Free Fire 钻石',
                th: 'Free Fire เพชร',
                vi: 'Free Fire Kim Cương'
            },
            baseName: 'free-fire',
            denominations: [ 100, 310, 520, 1060, 2180, 5600 ],
            basePrice: 0.025,
            category: 'game_card',
            tags: [ 'free-fire', 'diamonds', 'garena', 'battle-royale' ]
        },
        {
            name: {
                en: 'Call of Duty Mobile CP',
                zh: '使命召唤手游 CP',
                th: 'Call of Duty Mobile CP',
                vi: 'Call of Duty Mobile CP'
            },
            baseName: 'cod-mobile',
            denominations: [ 80, 500, 1100, 2400, 5000, 10800 ],
            basePrice: 0.012,
            category: 'game_card',
            tags: [ 'call-of-duty', 'cp', 'activision', 'fps' ]
        }
    ];

    const products = [];

    games.forEach( game => {
        game.denominations.forEach( denomination => {
            const productId = `${ game.baseName }-${ denomination }`;
            const basePrice = game.basePrice * denomination;

            products.push( {
                _id: productId,
                slug: `${ game.baseName }-${ denomination }`,
                name: {
                    en: `${ game.name.en } (${ denomination })`,
                    zh: `${ game.name.zh } (${ denomination })`,
                    th: `${ game.name.th } (${ denomination })`,
                    vi: `${ game.name.vi } (${ denomination })`
                },
                description: {
                    en: `${ denomination } ${ game.name.en } - Instant delivery within minutes. Safe and secure transaction.`,
                    zh: `${ denomination } ${ game.name.zh } - 几分钟内即时交付。安全可靠的交易。`,
                    th: `${ denomination } ${ game.name.th } - จัดส่งทันทีภายในไม่กี่นาที ธุรกรรมที่ปลอดภัยและเชื่อถือได้`,
                    vi: `${ denomination } ${ game.name.vi } - Giao hàng ngay lập tức trong vài phút. Giao dịch an toàn và bảo mật.`
                },
                sku: `${ game.baseName.toUpperCase() }-${ denomination }`,
                category: game.category,
                type: 'game_card',
                images: [
                    `https://images.unsplash.com/photo-${ faker.string.uuid().substring( 0, 8 ) }?w=800`,
                    `https://images.unsplash.com/photo-${ faker.string.uuid().substring( 0, 8 ) }?w=800`
                ],
                regionalPricing: [
                    {
                        region: 'GLOBAL',
                        currency: 'USD',
                        price: basePrice * 1.1, // 加10%作为原价
                        discountPrice: basePrice,
                        stock: faker.number.int( { min: 100, max: 5000 } ),
                        isAvailable: true
                    },
                    {
                        region: 'MY',
                        currency: 'MYR',
                        price: basePrice * 4.7 * 1.1,
                        discountPrice: basePrice * 4.7,
                        stock: faker.number.int( { min: 50, max: 2000 } ),
                        isAvailable: true
                    },
                    {
                        region: 'TH',
                        currency: 'THB',
                        price: basePrice * 36 * 1.1,
                        discountPrice: basePrice * 36,
                        stock: faker.number.int( { min: 30, max: 1000 } ),
                        isAvailable: true
                    }
                ],
                tags: [ ...game.tags, `${ denomination }` ],
                isFeatured: denomination >= 1000, // 大面值的设为特色产品
                isActive: true
            } );
        } );
    } );

    return products;
}

// 礼品卡数据生成器
function generateGiftCards() {
    const giftCards = [
        {
            name: {
                en: 'Steam Gift Card',
                zh: 'Steam 礼品卡',
                th: 'บัตรของขวัญ Steam',
                vi: 'Thẻ quà tặng Steam'
            },
            baseName: 'steam',
            denominations: [ 10, 20, 50, 100 ],
            basePrice: 1.0,
            category: 'gift_card',
            tags: [ 'steam', 'gift-card', 'valve', 'gaming' ]
        },
        {
            name: {
                en: 'Google Play Gift Card',
                zh: 'Google Play 礼品卡',
                th: 'บัตรของขวัญ Google Play',
                vi: 'Thẻ quà tặng Google Play'
            },
            baseName: 'google-play',
            denominations: [ 10, 25, 50, 100 ],
            basePrice: 1.0,
            category: 'gift_card',
            tags: [ 'google-play', 'gift-card', 'android', 'apps' ]
        },
        {
            name: {
                en: 'Apple App Store Gift Card',
                zh: '苹果 App Store 礼品卡',
                th: 'บัตรของขวัญ Apple App Store',
                vi: 'Thẻ quà tặng Apple App Store'
            },
            baseName: 'apple-app-store',
            denominations: [ 10, 25, 50, 100 ],
            basePrice: 1.0,
            category: 'gift_card',
            tags: [ 'apple', 'app-store', 'gift-card', 'ios' ]
        },
        {
            name: {
                en: 'Amazon Gift Card',
                zh: '亚马逊礼品卡',
                th: 'บัตรของขวัญ Amazon',
                vi: 'Thẻ quà tặng Amazon'
            },
            baseName: 'amazon',
            denominations: [ 25, 50, 100, 200 ],
            basePrice: 1.0,
            category: 'gift-card',
            tags: [ 'amazon', 'gift-card', 'shopping' ]
        }
    ];

    const products = [];

    giftCards.forEach( card => {
        card.denominations.forEach( denomination => {
            const productId = `${ card.baseName }-${ denomination }`;

            products.push( {
                _id: productId,
                slug: `${ card.baseName }-gift-card-${ denomination }`,
                name: {
                    en: `${ card.name.en } $${ denomination }`,
                    zh: `${ card.name.zh } $${ denomination }`,
                    th: `${ card.name.th } $${ denomination }`,
                    vi: `${ card.name.vi } $${ denomination }`
                },
                description: {
                    en: `$${ denomination } ${ card.name.en }. Redeem for games, apps, music, and more. Instant digital delivery.`,
                    zh: `$${ denomination } ${ card.name.zh }。兑换游戏、应用、音乐等。即时数字交付。`,
                    th: `$${ denomination } ${ card.name.th } แลกสำหรับเกม แอป เพลง และอื่นๆ จัดส่งดิจิทัลทันที`,
                    vi: `$${ denomination } ${ card.name.vi }. Đổi lấy trò chơi, ứng dụng, nhạc và hơn thế nữa. Giao hàng kỹ thuật số ngay lập tức.`
                },
                sku: `${ card.baseName.toUpperCase() }-${ denomination }`,
                category: card.category,
                type: 'gift_card',
                images: [
                    `https://images.unsplash.com/photo-${ faker.string.uuid().substring( 0, 8 ) }?w=800`
                ],
                regionalPricing: [
                    {
                        region: 'GLOBAL',
                        currency: 'USD',
                        price: denomination * card.basePrice * 1.05, // 加5%手续费
                        discountPrice: denomination * card.basePrice,
                        stock: faker.number.int( { min: 100, max: 1000 } ),
                        isAvailable: true
                    }
                ],
                tags: [ ...card.tags, `$${ denomination }` ],
                isFeatured: denomination >= 50,
                isActive: true
            } );
        } );
    } );

    return products;
}

// 手机充值数据生成器
function generateTopUpProducts() {
    const topUps = [
        {
            name: {
                en: 'Malaysia Mobile Top-up',
                zh: '马来西亚手机充值',
                th: 'เติมเงินมือถือมาเลเซีย',
                vi: 'Nạp tiền điện thoại Malaysia'
            },
            baseName: 'malaysia-topup',
            denominations: [ 10, 20, 30, 50, 100 ],
            currency: 'MYR',
            region: 'MY',
            category: 'digital_code',
            tags: [ 'malaysia', 'topup', 'prepaid', 'mobile' ]
        },
        {
            name: {
                en: 'Thailand Mobile Top-up',
                zh: '泰国手机充值',
                th: 'เติมเงินมือถือไทย',
                vi: 'Nạp tiền điện thoại Thái Lan'
            },
            baseName: 'thailand-topup',
            denominations: [ 100, 200, 300, 500, 1000 ],
            currency: 'THB',
            region: 'TH',
            category: 'digital_code',
            tags: [ 'thailand', 'topup', 'prepaid', 'ais', 'dtac' ]
        },
        {
            name: {
                en: 'Vietnam Mobile Top-up',
                zh: '越南手机充值',
                th: 'เติมเงินมือถือเวียดนาม',
                vi: 'Nạp tiền điện thoại Việt Nam'
            },
            baseName: 'vietnam-topup',
            denominations: [ 50000, 100000, 200000, 500000 ],
            currency: 'VND',
            region: 'VN',
            category: 'digital_code',
            tags: [ 'vietnam', 'topup', 'prepaid', 'vinaphone', 'mobifone' ]
        }
    ];

    const products = [];

    topUps.forEach( topup => {
        topup.denominations.forEach( denomination => {
            const productId = `${ topup.baseName }-${ denomination }`;

            products.push( {
                _id: productId,
                slug: `${ topup.baseName }-${ denomination }`,
                name: {
                    en: `${ topup.name.en } (${ denomination } ${ topup.currency })`,
                    zh: `${ topup.name.zh } (${ denomination } ${ topup.currency })`,
                    th: `${ topup.name.th } (${ denomination } ${ topup.currency })`,
                    vi: `${ topup.name.vi } (${ denomination } ${ topup.currency })`
                },
                description: {
                    en: `${ denomination } ${ topup.currency } ${ topup.name.en }. Support all major operators. Instant delivery.`,
                    zh: `${ denomination } ${ topup.currency } ${ topup.name.zh }。支持所有主要运营商。即时交付。`,
                    th: `${ denomination } ${ topup.currency } ${ topup.name.th } รองรับผู้ให้บริการหลักทั้งหมด จัดส่งทันที`,
                    vi: `${ denomination } ${ topup.currency } ${ topup.name.vi }. Hỗ trợ tất cả các nhà mạng chính. Giao hàng ngay lập tức.`
                },
                sku: `${ topup.baseName.toUpperCase() }-${ denomination }`,
                category: topup.category,
                type: 'digital_code',
                images: [
                    `https://images.unsplash.com/photo-${ faker.string.uuid().substring( 0, 8 ) }?w=800`
                ],
                regionalPricing: [
                    {
                        region: topup.region,
                        currency: topup.currency,
                        price: denomination,
                        discountPrice: denomination,
                        stock: 999, // 手机充值通常库存充足
                        isAvailable: true
                    }
                ],
                tags: [ ...topup.tags, `${ denomination }${ topup.currency }` ],
                isFeatured: false,
                isActive: true
            } );
        } );
    } );

    return products;
}

// 主函数
async function generateAndImportData() {
    try {
        console.log( '🚀 开始数据生成和导入流程...' );

        // 连接到 MongoDB
        console.log( '🔌 连接到 MongoDB...' );
        await mongoose.connect( MONGO_URI );
        console.log( '✅ MongoDB 已连接' );

        // 清空现有数据
        console.log( '\n🗑️  清空现有数据...' );
        await Product.deleteMany( {} );
        console.log( '✅ 产品数据已清空' );

        // 生成数据
        console.log( '\n📊 生成测试数据...' );
        const gameProducts = generateGameProducts();
        const giftCardProducts = generateGiftCards();
        const topUpProducts = generateTopUpProducts();

        const allProducts = [ ...gameProducts, ...giftCardProducts, ...topUpProducts ];

        console.log( `📦 生成产品数据统计:` );
        console.log( `   🎮 游戏产品: ${ gameProducts.length } 个` );
        console.log( `   🎁 礼品卡: ${ giftCardProducts.length } 个` );
        console.log( `   📱 手机充值: ${ topUpProducts.length } 个` );
        console.log( `   📊 总计: ${ allProducts.length } 个产品` );

        // 插入数据
        console.log( '\n💾 导入数据到数据库...' );
        const insertedProducts = await Product.insertMany( allProducts );
        console.log( `✅ 已成功导入 ${ insertedProducts.length } 个产品` );

        // 统计信息
        console.log( '\n📈 数据库统计信息:' );

        const totalStock = insertedProducts.reduce( ( sum, product ) => {
            return sum + product.regionalPricing.reduce( ( stockSum, rp ) => stockSum + rp.stock, 0 );
        }, 0 );

        const featuredProducts = insertedProducts.filter( p => p.isFeatured ).length;
        const activeProducts = insertedProducts.filter( p => p.isActive ).length;

        console.log( `   📦 产品总数: ${ insertedProducts.length }` );
        console.log( `   ⭐ 特色产品: ${ featuredProducts }` );
        console.log( `   ✅ 活跃产品: ${ activeProducts }` );
        console.log( `   📊 总库存量: ${ totalStock }` );

        // 按类别统计
        const categories = {};
        insertedProducts.forEach( product => {
            categories[ product.category ] = ( categories[ product.category ] || 0 ) + 1;
        } );

        console.log( '\n📂 产品分类统计:' );
        Object.entries( categories ).forEach( ( [ category, count ] ) => {
            console.log( `   ${ category }: ${ count } 个产品` );
        } );

        // 热门产品展示
        console.log( '\n🔥 热门产品示例:' );
        insertedProducts
            .filter( p => p.isFeatured )
            .slice( 0, 5 )
            .forEach( p => {
                const price = p.regionalPricing[ 0 ]?.discountPrice || p.regionalPricing[ 0 ]?.price || 0;
                console.log( `   • ${ p.name.en } - $${ price }` );
            } );

        console.log( '\n🎉 数据生成和导入完成！' );
        console.log( '\n🌍 多语言支持:' );
        console.log( `   所有产品支持 4 种语言: 英文, 中文, 泰语, 越南语` );

        console.log( '\n💡 下一步操作:' );
        console.log( '   1. 确保产品服务正在运行: cd services/product-service && npm start' );
        console.log( '   2. 访问产品列表: http://localhost:3001/en/products' );
        console.log( '   3. 测试产品详情页面' );

    } catch ( error ) {
        console.error( '❌ 错误:', error );
        process.exit( 1 );
    } finally {
        await mongoose.connection.close();
        console.log( '\n👋 数据库连接已关闭' );
        process.exit( 0 );
    }
}

// 运行主函数
generateAndImportData();
