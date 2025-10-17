const mongoose = require( 'mongoose' );

mongoose.connect( 'mongodb+srv://herbertlim:kxKl8gF8JMx3XqBr@marketplace.9ieh5.mongodb.net/marketplace?retryWrites=true&w=majority' )
    .then( () => {
        console.log( 'Connected to MongoDB' );
        const db = mongoose.connection.db;
        return db.collection( 'products' ).find( {}, { name: 1, regionalPricing: 1, regionPrices: 1 } ).toArray();
    } )
    .then( products => {
        console.log( '\n=== 产品数据结构验证 ===' );
        products.forEach( product => {
            console.log( '\n商品:', product.name );
            console.log( 'ID:', product._id );
            console.log( '有 regionalPricing:', !!product.regionalPricing );
            console.log( '有 regionPrices:', !!product.regionPrices );
            if ( product.regionalPricing ) {
                console.log( 'regionalPricing 面额数:', product.regionalPricing.length );
                product.regionalPricing.slice( 0, 2 ).forEach( ( rp, i ) => {
                    console.log( `  面额${ i + 1 }: ${ rp.denomination } (${ rp.region }, ${ rp.currency })` );
                } );
            }
        } );
        process.exit( 0 );
    } )
    .catch( err => {
        console.error( 'Error:', err.message );
        process.exit( 1 );
    } );