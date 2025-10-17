const mongoose = require( 'mongoose' );

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if ( !uri ) throw new Error( '❌ Missing MONGO_URI environment variable' );

        const conn = await mongoose.connect( uri );
        console.log( `✅ MongoDB Connected: ${ conn.connection.host }` );
    } catch ( error ) {
        console.error( `❌ MongoDB Connection Error: ${ error.message }` );
        process.exit( 1 );
    }
};

module.exports = connectDB;
