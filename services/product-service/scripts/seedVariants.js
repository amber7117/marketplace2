const mongoose = require( 'mongoose' );
const Product = require( '../src/models/Product' );
const ProductVariant = require( '../src/models/ProductVariant' );
require( 'dotenv' ).config( { path: require( 'path' ).join( __dirname, '../.env' ) } );

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/marketplace';

// 示例变体数据
const variantTemplates = {
    'steam-wallet': [
        { region: 'MY', currency: 'MYR', faceValues: [ 5, 10, 20, 30, 50, 100 ] },
        { region: 'TH', currency: 'THB', faceValues: [ 50, 100, 200, 500, 1000 ] },
        { region: 'SG', currency: 'SGD', faceValues: [ 5, 10, 20, 50, 100 ] },
        { region: 'VN', currency: 'VND', faceValues: [ 50000, 100000, 200000, 500000 ] },
        { region: 'PH', currency: 'PHP', faceValues: [ 100, 250, 500, 1000 ] }
    ],
    'google-play': [
        { region: 'MY', currency: 'MYR', faceValues: [ 10, 20, 30, 50, 100 ] },
        { region: 'TH', currency: 'THB', faceValues: [ 150, 300, 500, 1000 ] },
        { region: 'SG', currency: 'SGD', faceValues: [ 10, 20, 50, 100 ] }
    ],
    'psn': [
        { region: 'MY', currency: 'MYR', faceValues: [ 20, 50, 100, 200 ] },
        { region: 'TH', currency: 'THB', faceValues: [ 300, 500, 1000, 2000 ] },
        { region: 'SG', currency: 'SGD', faceValues: [ 20, 50, 100 ] }
    ],
    'xbox': [
        { region: 'MY', currency: 'MYR', faceValues: [ 25, 50, 100, 200 ] },
        { region: 'GLOBAL', currency: 'USD', faceValues: [ 10, 25, 50, 100 ] }
    ]
};

// 根据面值计算价格（添加10-20%的利润）
function calculatePricing( faceValue, currency ) {
    const basePrice = faceValue;
    const markup = 1.15; // 15% markup
    const originalPrice = Math.ceil( basePrice * markup );

    // Random discount 0-10%
    const discountPercent = Math.random() > 0.5 ? Math.floor( Math.random() * 10 ) : 0;
    const price = originalPrice - ( originalPrice * discountPercent / 100 );

    return {
        originalPrice,
        price: Math.ceil( price ),
        costPrice: basePrice
    };
}

async function seedVariants() {
    try {
        console.log( '🔌 Connecting to MongoDB...' );
        await mongoose.connect( MONGO_URI );
        console.log( '✅ Connected to MongoDB' );

        console.log( '🗑️  Clearing existing variants...' );
        await ProductVariant.deleteMany( {} );

        console.log( '📦 Fetching products...' );
        const products = await Product.find( { isActive: true } ).lean();

        if ( products.length === 0 ) {
            console.log( '❌ No products found. Please seed products first.' );
            process.exit( 1 );
        }

        console.log( `✅ Found ${ products.length } products` );

        const variantsToCreate = [];

        for ( const product of products ) {
            // 根据产品名称匹配模板
            let template = null;
            const productName = product.name.toLowerCase();

            if ( productName.includes( 'steam' ) ) {
                template = variantTemplates[ 'steam-wallet' ];
            } else if ( productName.includes( 'google' ) || productName.includes( 'play' ) ) {
                template = variantTemplates[ 'google-play' ];
            } else if ( productName.includes( 'psn' ) || productName.includes( 'playstation' ) ) {
                template = variantTemplates[ 'psn' ];
            } else if ( productName.includes( 'xbox' ) ) {
                template = variantTemplates[ 'xbox' ];
            }

            if ( !template ) {
                // 默认模板
                template = [
                    { region: 'GLOBAL', currency: 'USD', faceValues: [ 10, 25, 50, 100 ] }
                ];
            }

            // 为每个地区和面值创建变体
            template.forEach( ( regionTemplate, regionIndex ) => {
                regionTemplate.faceValues.forEach( ( faceValue, valueIndex ) => {
                    const pricing = calculatePricing( faceValue, regionTemplate.currency );
                    const sortOrder = ( regionIndex * 100 ) + valueIndex;

                    variantsToCreate.push( {
                        product: product._id,
                        label: `${ product.name } ${ regionTemplate.currency } ${ faceValue }`,
                        sku: `${ product.slug }-${ regionTemplate.region }-${ faceValue }`.toUpperCase(),
                        faceValue,
                        region: regionTemplate.region,
                        currency: regionTemplate.currency,
                        pricing,
                        stock: {
                            quantity: Math.floor( Math.random() * 500 ) + 100,
                            isUnlimited: false
                        },
                        isActive: true,
                        sortOrder
                    } );
                } );
            } );
        }

        console.log( `📝 Creating ${ variantsToCreate.length } variants...` );
        await ProductVariant.insertMany( variantsToCreate );

        console.log( '✅ Product variants seeded successfully!' );

        // 显示统计
        const stats = await ProductVariant.aggregate( [
            {
                $group: {
                    _id: '$region',
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$pricing.price' }
                }
            },
            { $sort: { _id: 1 } }
        ] );

        console.log( '\n📊 Variants by Region:' );
        stats.forEach( stat => {
            console.log( `   ${ stat._id }: ${ stat.count } variants (Avg: ${ stat.avgPrice.toFixed( 2 ) })` );
        } );

        process.exit( 0 );
    } catch ( error ) {
        console.error( '❌ Error seeding variants:', error );
        process.exit( 1 );
    }
}

// 运行种子脚本
seedVariants();
