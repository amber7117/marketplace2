require( 'dotenv' ).config();
const mongoose = require( 'mongoose' );
const Wallet = require( './src/models/Wallet' );
const Transaction = require( './src/models/Transaction' );

// Sample user IDs (should match users from auth-service)
const SAMPLE_USERS = [
    {
        id: '507f1f77bcf86cd799439011',
        email: 'user1@example.com',
    },
    {
        id: '507f1f77bcf86cd799439012',
        email: 'user2@example.com',
    },
    {
        id: '507f1f77bcf86cd799439013',
        email: 'admin@example.com',
    },
];

const seedDatabase = async () => {
    try {
        console.log( '🌱 Starting database seeding...' );

        // Connect to database
        await mongoose.connect( process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } );
        console.log( '✅ Connected to MongoDB' );

        // Clear existing data
        await Wallet.deleteMany( {} );
        await Transaction.deleteMany( {} );
        console.log( '🗑️  Cleared existing data' );

        // Create wallets
        const wallets = [];
        for ( const user of SAMPLE_USERS ) {
            const wallet = await Wallet.create( {
                user: user.id,
                userEmail: user.email,
                balance: Math.floor( Math.random() * 10000 ) + 1000,
                frozenBalance: 0,
                currency: 'MYR',
                status: 'active',
                totalDeposit: Math.floor( Math.random() * 15000 ) + 5000,
                totalWithdraw: Math.floor( Math.random() * 2000 ),
                totalSpent: Math.floor( Math.random() * 5000 ),
                totalRefund: Math.floor( Math.random() * 500 ),
            } );
            wallets.push( wallet );
            console.log( `✅ Created wallet for ${ user.email }` );
        }

        // Create sample transactions for each wallet
        for ( const wallet of wallets ) {
            // Deposit transactions
            for ( let i = 0; i < 3; i++ ) {
                const amount = Math.floor( Math.random() * 1000 ) + 100;
                await Transaction.create( {
                    transactionId: Transaction.generateTransactionId(),
                    wallet: wallet._id,
                    user: wallet.user,
                    type: 'deposit',
                    amount,
                    balanceBefore: wallet.balance - amount,
                    balanceAfter: wallet.balance,
                    currency: wallet.currency,
                    status: 'completed',
                    description: `Deposit via ${ [ 'stripe', 'razer', 'fpx' ][ i % 3 ] }`,
                    paymentMethod: [ 'stripe', 'razer', 'fpx' ][ i % 3 ],
                    processedAt: new Date( Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 ),
                } );
            }

            // Deduct transactions (purchases)
            for ( let i = 0; i < 5; i++ ) {
                const amount = Math.floor( Math.random() * 500 ) + 50;
                await Transaction.create( {
                    transactionId: Transaction.generateTransactionId(),
                    wallet: wallet._id,
                    user: wallet.user,
                    type: 'deduct',
                    amount: -amount,
                    balanceBefore: wallet.balance + amount,
                    balanceAfter: wallet.balance,
                    currency: wallet.currency,
                    status: 'completed',
                    description: 'Purchase order',
                    reference: {
                        type: 'order',
                        id: new mongoose.Types.ObjectId().toString(),
                    },
                    metadata: {
                        orderNumber: `VTP-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2, 8 ).toUpperCase() }`,
                        productName: [ 'Steam Gift Card', 'PlayStation Plus', 'Xbox Game Pass', 'Nintendo eShop' ][ i % 4 ],
                    },
                    processedAt: new Date( Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000 ),
                } );
            }

            // Refund transactions
            const refundAmount = Math.floor( Math.random() * 200 ) + 50;
            await Transaction.create( {
                transactionId: Transaction.generateTransactionId(),
                wallet: wallet._id,
                user: wallet.user,
                type: 'refund',
                amount: refundAmount,
                balanceBefore: wallet.balance - refundAmount,
                balanceAfter: wallet.balance,
                currency: wallet.currency,
                status: 'completed',
                description: 'Order refund - cancelled order',
                reference: {
                    type: 'order',
                    id: new mongoose.Types.ObjectId().toString(),
                },
                metadata: {
                    orderNumber: `VTP-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2, 8 ).toUpperCase() }`,
                    reason: 'Order cancelled by user',
                },
                processedAt: new Date( Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000 ),
            } );

            console.log( `✅ Created transactions for wallet ${ wallet._id }` );
        }

        // Create a frozen wallet example
        const frozenWallet = wallets[ 0 ];
        frozenWallet.status = 'frozen';
        frozenWallet.frozenReason = 'Suspicious activity detected';
        frozenWallet.frozenAt = new Date();
        await frozenWallet.save();
        console.log( `❄️  Froze wallet for ${ frozenWallet.userEmail }` );

        console.log( '\n✅ Database seeding completed successfully!' );
        console.log( '\n📊 Summary:' );
        console.log( `   - Wallets created: ${ wallets.length }` );
        console.log( `   - Transactions created: ${ wallets.length * 9 }` );
        console.log( `   - Frozen wallets: 1` );

        process.exit( 0 );
    } catch ( error ) {
        console.error( '❌ Error seeding database:', error );
        process.exit( 1 );
    }
};

// Run seeding
seedDatabase();
