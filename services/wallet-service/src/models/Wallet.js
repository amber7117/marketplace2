const mongoose = require( 'mongoose' );

const walletSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true,
        },
        userEmail: {
            type: String,
            required: true,
        },
        balance: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        frozenBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        availableBalance: {
            type: Number,
            default: 0,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            default: 'MYR',
            enum: [ 'MYR', 'USD', 'SGD', 'THB', 'IDR', 'VND' ],
        },
        status: {
            type: String,
            enum: [ 'active', 'frozen', 'closed' ],
            default: 'active',
            index: true,
        },
        frozenReason: {
            type: String,
        },
        frozenAt: {
            type: Date,
        },
        totalDeposit: {
            type: Number,
            default: 0,
        },
        totalWithdraw: {
            type: Number,
            default: 0,
        },
        totalSpent: {
            type: Number,
            default: 0,
        },
        totalRefund: {
            type: Number,
            default: 0,
        },
        metadata: {
            type: Map,
            of: String,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual field for available balance calculation
walletSchema.virtual( 'realAvailableBalance' ).get( function () {
    return this.balance - this.frozenBalance;
} );

// Update available balance before save
walletSchema.pre( 'save', function ( next ) {
    this.availableBalance = this.balance - this.frozenBalance;
    next();
} );

// Instance methods
walletSchema.methods.canDeduct = function ( amount ) {
    return this.availableBalance >= amount && this.status === 'active';
};

walletSchema.methods.freeze = function ( reason ) {
    this.status = 'frozen';
    this.frozenReason = reason;
    this.frozenAt = new Date();
};

walletSchema.methods.unfreeze = function () {
    this.status = 'active';
    this.frozenReason = undefined;
    this.frozenAt = undefined;
};

walletSchema.methods.freezeAmount = function ( amount ) {
    if ( this.availableBalance < amount ) {
        throw new Error( 'Insufficient available balance to freeze' );
    }
    this.frozenBalance += amount;
    this.availableBalance = this.balance - this.frozenBalance;
};

walletSchema.methods.unfreezeAmount = function ( amount ) {
    if ( this.frozenBalance < amount ) {
        throw new Error( 'Cannot unfreeze more than frozen amount' );
    }
    this.frozenBalance -= amount;
    this.availableBalance = this.balance - this.frozenBalance;
};

// Static methods
walletSchema.statics.findByUser = function ( userId ) {
    return this.findOne( { user: userId, status: { $ne: 'closed' } } );
};

// Indexes
walletSchema.index( { user: 1, status: 1 } );
walletSchema.index( { userEmail: 1 } );
walletSchema.index( { createdAt: -1 } );

const Wallet = mongoose.model( 'Wallet', walletSchema );

module.exports = Wallet;
