const mongoose = require( 'mongoose' );
require( 'dotenv' ).config();

// Connect to MongoDB
mongoose.connect( process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-trading-order' )
    .then( () => console.log( 'MongoDB Connected for seeding' ) )
    .catch( err => console.error( 'MongoDB connection error:', err ) );

const Order = require( './src/models/Order' );

const sampleOrders = [
    {
        orderNumber: 'VTP-SAMPLE-001',
        user: new mongoose.Types.ObjectId( '507f1f77bcf86cd799439011' ),
        userEmail: 'john@example.com',
        items: [
            {
                product: new mongoose.Types.ObjectId( '507f1f77bcf86cd799439012' ),
                productName: 'Steam Gift Card $50',
                productType: 'gift_card',
                quantity: 1,
                unitPrice: 45.00,
                totalPrice: 45.00,
                deliveryCode: 'STEAM-XXXX-XXXX-XXXX'
            }
        ],
        status: 'completed',
        payment: {
            method: 'wallet',
            transactionId: 'TXN-001',
            amount: 45.00,
            currency: 'USD',
            status: 'completed',
            paidAt: new Date()
        },
        delivery: {
            method: 'instant',
            status: 'delivered',
            deliveredAt: new Date(),
            codes: [ 'STEAM-XXXX-XXXX-XXXX' ]
        },
        totals: {
            subtotal: 45.00,
            tax: 0,
            discount: 0,
            total: 45.00
        },
        completedAt: new Date()
    },
    {
        orderNumber: 'VTP-SAMPLE-002',
        user: new mongoose.Types.ObjectId( '507f1f77bcf86cd799439011' ),
        userEmail: 'john@example.com',
        items: [
            {
                product: new mongoose.Types.ObjectId( '507f1f77bcf86cd799439013' ),
                productName: 'PlayStation Plus 12 Month',
                productType: 'subscription',
                quantity: 1,
                unitPrice: 60.00,
                totalPrice: 60.00
            }
        ],
        status: 'pending',
        payment: {
            method: 'stripe',
            amount: 60.00,
            currency: 'USD',
            status: 'pending'
        },
        delivery: {
            method: 'instant',
            status: 'pending'
        },
        totals: {
            subtotal: 60.00,
            tax: 0,
            discount: 0,
            total: 60.00
        }
    }
];

const seedOrders = async () => {
    try {
        // Clear existing orders
        await Order.deleteMany( {} );
        console.log( 'Cleared existing orders' );

        // Insert sample orders
        await Order.insertMany( sampleOrders );
        console.log( 'Sample orders inserted successfully' );

        process.exit( 0 );
    } catch ( error ) {
        console.error( 'Error seeding orders:', error );
        process.exit( 1 );
    }
};

seedOrders();
