// 数据迁移脚本：将 regionPrices 数据迁移到 regionalPricing
// 使用方法: node scripts/migrate-to-regional-pricing.js

require( 'dotenv' ).config( { path: '../.env' } );
const mongoose = require( 'mongoose' );

// MongoDB 连接
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://client2:5252Meimei@cluster0.bkbwpfb.mongodb.net/marketplace';

async function connectDB() {
    try {
        await mongoose.connect( MONGO_URI );
        console.log( '✅ 已连接到 MongoDB Atlas' );
    } catch ( error ) {
        console.error( '❌ MongoDB 连接失败:', error );
        process.exit( 1 );
    }
}

async function migrateRegionalPricing() {
    try {
        console.log( '🔄 开始迁移面额数据...\n' );

        // 获取所有有 regionPrices 数据的产品
        const products = await mongoose.connection.db.collection( 'products' ).find( {
            regionPrices: { $exists: true, $ne: [] }
        } ).toArray();

        console.log( `📋 找到 ${ products.length } 个需要迁移的产品` );

        let migratedCount = 0;

        for ( const product of products ) {
            console.log( `\n🔧 迁移产品: ${ product.name } (${ product.slug })` );

            // 将 regionPrices 转换为 regionalPricing 格式
            const regionalPricing = product.regionPrices.map( rp => ( {
                region: rp.region,
                currency: rp.currency,
                denomination: rp.denomination,
                price: rp.price,
                discountPrice: rp.originalPrice, // originalPrice -> discountPrice
                stock: rp.stock,
                isAvailable: rp.isActive,
                isInstantDelivery: rp.isInstantDelivery || true,
                platformLogo: rp.platformLogo,
                displayOrder: rp.displayOrder || 0
            } ) );

            // 更新产品
            const updateResult = await mongoose.connection.db.collection( 'products' ).updateOne(
                { _id: product._id },
                {
                    $set: {
                        regionalPricing: regionalPricing
                    },
                    // 可选：保留原有的 regionPrices 作为备份
                    // $unset: { regionPrices: "" } // 如果要删除原字段，取消注释
                }
            );

            if ( updateResult.modifiedCount > 0 ) {
                console.log( `   ✅ 成功迁移 ${ regionalPricing.length } 个面额` );
                migratedCount++;

                // 显示迁移的面额详情
                regionalPricing.forEach( ( rp, index ) => {
                    const status = rp.stock > 0 ? '✅' : '❌';
                    const delivery = rp.isInstantDelivery ? '⚡' : '📦';
                    console.log( `      ${ index + 1 }. ${ status } ${ delivery } ${ rp.denomination } - $${ rp.price } (库存: ${ rp.stock })` );
                } );
            } else {
                console.log( `   ⚠️  产品已存在 regionalPricing 数据，跳过迁移` );
            }
        }

        console.log( `\n🎉 迁移完成！` );
        console.log( `   - 处理产品总数: ${ products.length }` );
        console.log( `   - 成功迁移产品: ${ migratedCount }` );
        console.log( `   - 跳过产品数量: ${ products.length - migratedCount }` );

    } catch ( error ) {
        console.error( '❌ 迁移失败:', error );
        throw error;
    }
}

async function validateMigration() {
    try {
        console.log( '\n🔍 验证迁移结果...' );

        // 检查迁移后的数据
        const productsWithRegionalPricing = await mongoose.connection.db.collection( 'products' ).find( {
            regionalPricing: { $exists: true, $ne: [] }
        } ).toArray();

        console.log( `\n📊 迁移验证结果:` );
        console.log( `   - 有 regionalPricing 数据的产品: ${ productsWithRegionalPricing.length }` );

        // 显示每个产品的面额统计
        for ( const product of productsWithRegionalPricing ) {
            const validDenominations = product.regionalPricing.filter( rp => rp.isAvailable );
            const totalStock = product.regionalPricing.reduce( ( sum, rp ) => sum + ( rp.stock || 0 ), 0 );

            console.log( `\n   🎮 ${ product.name }:` );
            console.log( `      - 总面额数: ${ product.regionalPricing.length }` );
            console.log( `      - 可用面额: ${ validDenominations.length }` );
            console.log( `      - 总库存: ${ totalStock }` );
            console.log( `      - 支持地区: ${ [ ...new Set( product.regionalPricing.map( rp => rp.region ) ) ].join( ', ' ) }` );
        }

    } catch ( error ) {
        console.error( '❌ 验证失败:', error );
    }
}

// 主执行函数
async function main() {
    try {
        await connectDB();
        await migrateRegionalPricing();
        await validateMigration();

        console.log( '\n✅ 数据迁移和验证完成！' );
        console.log( '\n📝 下一步:' );
        console.log( '   1. 更新前端代码以使用 regionalPricing 字段' );
        console.log( '   2. 测试所有面额选择功能' );
        console.log( '   3. 如果一切正常，可以删除 regionPrices 字段' );

    } catch ( error ) {
        console.error( '💥 迁移过程失败:', error );
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
    migrateRegionalPricing,
    validateMigration,
    connectDB
};