/**
 * Cloudflare Worker for Wallet Service
 * Wallet management service using Cloudflare D1 database
 */

export default {
    async fetch( request, env, ctx ) {
        const url = new URL( request.url );
        const path = url.pathname;

        // Set CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        };

        // Handle preflight requests
        if ( request.method === 'OPTIONS' ) {
            return new Response( null, {
                headers: corsHeaders,
            } );
        }

        try {
            // Initialize database if needed
            await initializeDatabase( env.DB );

            // Route requests
            if ( path === '/health' ) {
                return handleHealth( request, env, corsHeaders );
            } else if ( path === '/wallet' && request.method === 'GET' ) {
                return handleGetWallet( request, env, corsHeaders );
            } else if ( path === '/wallet/deposit' && request.method === 'POST' ) {
                return handleDeposit( request, env, corsHeaders );
            } else if ( path === '/wallet/deduct' && request.method === 'POST' ) {
                return handleDeduct( request, env, corsHeaders );
            } else if ( path === '/wallet/refund' && request.method === 'POST' ) {
                return handleRefund( request, env, corsHeaders );
            } else if ( path === '/wallet/transactions' && request.method === 'GET' ) {
                return handleGetTransactions( request, env, corsHeaders );
            } else {
                return jsonResponse( {
                    error: 'Not found',
                    message: 'Available endpoints: /health, /wallet, /wallet/deposit, /wallet/deduct, /wallet/refund, /wallet/transactions'
                }, 404, corsHeaders );
            }
        } catch ( error ) {
            console.error( 'Wallet Worker error:', error );
            return jsonResponse( {
                error: 'Internal server error',
                message: error.message
            }, 500, corsHeaders );
        }
    },
};

// Initialize database tables
async function initializeDatabase( db ) {
    try {
        await db.exec( `
      CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        balance DECIMAL(10,2) DEFAULT 0.00,
        currency TEXT DEFAULT 'USD',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await db.exec( `
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        wallet_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        reference_id TEXT,
        status TEXT DEFAULT 'completed',
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (wallet_id) REFERENCES wallets(id)
      )
    `);
    } catch ( error ) {
        console.error( 'Database initialization error:', error );
    }
}

// Health check endpoint
async function handleHealth( request, env, corsHeaders ) {
    try {
        // Test database connection
        await env.DB.prepare( 'SELECT 1' ).run();

        return jsonResponse( {
            status: 'healthy',
            service: 'wallet-service',
            timestamp: new Date().toISOString(),
            database: 'connected'
        }, 200, corsHeaders );
    } catch ( error ) {
        return jsonResponse( {
            status: 'unhealthy',
            service: 'wallet-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        }, 503, corsHeaders );
    }
}

// Get wallet balance
async function handleGetWallet( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const wallet = await env.DB.prepare(
            'SELECT * FROM wallets WHERE user_id = ? AND is_active = 1'
        ).bind( userId ).first();

        if ( !wallet ) {
            // Create wallet if it doesn't exist
            const result = await env.DB.prepare(
                'INSERT INTO wallets (user_id, balance, currency) VALUES (?, 0.00, ?)'
            ).bind( userId, 'USD' ).run();

            return jsonResponse( {
                success: true,
                data: {
                    id: result.meta.last_row_id,
                    userId: userId,
                    balance: '0.00',
                    currency: 'USD',
                    isActive: true
                }
            }, 200, corsHeaders );
        }

        return jsonResponse( {
            success: true,
            data: {
                id: wallet.id,
                userId: wallet.user_id,
                balance: wallet.balance,
                currency: wallet.currency,
                isActive: !!wallet.is_active
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get wallet error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get wallet'
        }, 500, corsHeaders );
    }
}

// Deposit funds
async function handleDeposit( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { amount, description, referenceId } = await request.json();

        if ( !amount || amount <= 0 ) {
            return jsonResponse( {
                success: false,
                error: 'Valid amount is required'
            }, 400, corsHeaders );
        }

        // Get or create wallet
        let wallet = await env.DB.prepare(
            'SELECT * FROM wallets WHERE user_id = ? AND is_active = 1'
        ).bind( userId ).first();

        if ( !wallet ) {
            const createResult = await env.DB.prepare(
                'INSERT INTO wallets (user_id, balance, currency) VALUES (?, 0.00, ?)'
            ).bind( userId, 'USD' ).run();
            wallet = { id: createResult.meta.last_row_id, balance: 0.00 };
        }

        // Update balance
        const newBalance = parseFloat( wallet.balance ) + parseFloat( amount );
        await env.DB.prepare(
            'UPDATE wallets SET balance = ?, updated_at = ? WHERE id = ?'
        ).bind( newBalance.toFixed( 2 ), new Date().toISOString(), wallet.id ).run();

        // Create transaction record
        await env.DB.prepare(
            'INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind( wallet.id, 'deposit', amount, description || 'Wallet deposit', referenceId, 'completed' ).run();

        return jsonResponse( {
            success: true,
            message: 'Deposit successful',
            data: {
                newBalance: newBalance.toFixed( 2 ),
                amount: amount,
                transactionType: 'deposit'
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Deposit error:', error );
        return jsonResponse( {
            success: false,
            error: 'Deposit failed'
        }, 500, corsHeaders );
    }
}

// Deduct funds
async function handleDeduct( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { amount, description, referenceId } = await request.json();

        if ( !amount || amount <= 0 ) {
            return jsonResponse( {
                success: false,
                error: 'Valid amount is required'
            }, 400, corsHeaders );
        }

        // Get wallet
        const wallet = await env.DB.prepare(
            'SELECT * FROM wallets WHERE user_id = ? AND is_active = 1'
        ).bind( userId ).first();

        if ( !wallet ) {
            return jsonResponse( {
                success: false,
                error: 'Wallet not found'
            }, 404, corsHeaders );
        }

        // Check sufficient balance
        if ( parseFloat( wallet.balance ) < parseFloat( amount ) ) {
            return jsonResponse( {
                success: false,
                error: 'Insufficient balance'
            }, 400, corsHeaders );
        }

        // Update balance
        const newBalance = parseFloat( wallet.balance ) - parseFloat( amount );
        await env.DB.prepare(
            'UPDATE wallets SET balance = ?, updated_at = ? WHERE id = ?'
        ).bind( newBalance.toFixed( 2 ), new Date().toISOString(), wallet.id ).run();

        // Create transaction record
        await env.DB.prepare(
            'INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind( wallet.id, 'deduction', amount, description || 'Wallet deduction', referenceId, 'completed' ).run();

        return jsonResponse( {
            success: true,
            message: 'Deduction successful',
            data: {
                newBalance: newBalance.toFixed( 2 ),
                amount: amount,
                transactionType: 'deduction'
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Deduction error:', error );
        return jsonResponse( {
            success: false,
            error: 'Deduction failed'
        }, 500, corsHeaders );
    }
}

// Refund funds
async function handleRefund( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { amount, description, referenceId } = await request.json();

        if ( !amount || amount <= 0 ) {
            return jsonResponse( {
                success: false,
                error: 'Valid amount is required'
            }, 400, corsHeaders );
        }

        // Get wallet
        const wallet = await env.DB.prepare(
            'SELECT * FROM wallets WHERE user_id = ? AND is_active = 1'
        ).bind( userId ).first();

        if ( !wallet ) {
            return jsonResponse( {
                success: false,
                error: 'Wallet not found'
            }, 404, corsHeaders );
        }

        // Update balance
        const newBalance = parseFloat( wallet.balance ) + parseFloat( amount );
        await env.DB.prepare(
            'UPDATE wallets SET balance = ?, updated_at = ? WHERE id = ?'
        ).bind( newBalance.toFixed( 2 ), new Date().toISOString(), wallet.id ).run();

        // Create transaction record
        await env.DB.prepare(
            'INSERT INTO transactions (wallet_id, type, amount, description, reference_id, status) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind( wallet.id, 'refund', amount, description || 'Wallet refund', referenceId, 'completed' ).run();

        return jsonResponse( {
            success: true,
            message: 'Refund successful',
            data: {
                newBalance: newBalance.toFixed( 2 ),
                amount: amount,
                transactionType: 'refund'
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Refund error:', error );
        return jsonResponse( {
            success: false,
            error: 'Refund failed'
        }, 500, corsHeaders );
    }
}

// Get transaction history
async function handleGetTransactions( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const url = new URL( request.url );
        const limit = parseInt( url.searchParams.get( 'limit' ) ) || 50;
        const offset = parseInt( url.searchParams.get( 'offset' ) ) || 0;

        // Get wallet
        const wallet = await env.DB.prepare(
            'SELECT id FROM wallets WHERE user_id = ? AND is_active = 1'
        ).bind( userId ).first();

        if ( !wallet ) {
            return jsonResponse( {
                success: false,
                error: 'Wallet not found'
            }, 404, corsHeaders );
        }

        // Get transactions
        const transactions = await env.DB.prepare(
            'SELECT * FROM transactions WHERE wallet_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
        ).bind( wallet.id, limit, offset ).all();

        return jsonResponse( {
            success: true,
            data: transactions.results.map( tx => ( {
                id: tx.id,
                type: tx.type,
                amount: tx.amount,
                description: tx.description,
                referenceId: tx.reference_id,
                status: tx.status,
                createdAt: tx.created_at
            } ) )
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get transactions error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get transactions'
        }, 500, corsHeaders );
    }
}

// Helper functions
function jsonResponse( data, status = 200, corsHeaders = {} ) {
    return new Response( JSON.stringify( data, null, 2 ), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    } );
}

// Extract user ID from Authorization header (simplified)
function getUserIdFromAuth( request ) {
    const authHeader = request.headers.get( 'Authorization' );
    if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) ) {
        return null;
    }

    // In a real implementation, you would verify the JWT token
    // and extract the user ID from the payload
    // For now, we'll use a simplified approach
    try {
        const token = authHeader.substring( 7 );
        // This is a simplified token parsing - in production use proper JWT verification
        const parts = token.split( '.' );
        if ( parts.length === 3 ) {
            const payload = JSON.parse( atob( parts[ 1 ] ) );
            return payload.id || payload.userId;
        }
    } catch ( error ) {
        console.error( 'Token parsing error:', error );
    }

    return null;
}
