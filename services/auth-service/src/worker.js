/**
 * Cloudflare Worker for Auth Service
 * Authentication service using Cloudflare D1 database
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
            } else if ( path === '/api/auth/register' && request.method === 'POST' ) {
                return handleRegister( request, env, corsHeaders );
            } else if ( path === '/api/auth/login' && request.method === 'POST' ) {
                return handleLogin( request, env, corsHeaders );
            } else if ( path === '/api/auth/profile' && request.method === 'GET' ) {
                return handleGetProfile( request, env, corsHeaders );
            } else if ( path === '/api/auth/refresh-token' && request.method === 'POST' ) {
                return handleRefreshToken( request, env, corsHeaders );
            } else if ( path === '/api/auth/logout' && request.method === 'POST' ) {
                return handleLogout( request, env, corsHeaders );
            } else if ( path === '/api/auth/forgot-password' && request.method === 'POST' ) {
                return handleForgotPassword( request, env, corsHeaders );
            } else if ( path.startsWith( '/api/auth/verify-email/' ) && request.method === 'GET' ) {
                return handleVerifyEmail( request, env, corsHeaders, path );
            } else {
                return jsonResponse( {
                    error: 'Not found',
                    message: 'Available endpoints: /health, /api/auth/register, /api/auth/login, /api/auth/profile, /api/auth/refresh-token, /api/auth/logout, /api/auth/forgot-password, /api/auth/verify-email/:token'
                }, 404, corsHeaders );
            }
        } catch ( error ) {
            console.error( 'Auth Worker error:', error );
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
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        is_email_verified INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        login_attempts INTEGER DEFAULT 0,
        last_login_attempt TEXT,
        email_verification_token TEXT,
        email_verification_expires TEXT,
        password_reset_token TEXT,
        password_reset_expires TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            database: 'connected'
        }, 200, corsHeaders );
    } catch ( error ) {
        return jsonResponse( {
            status: 'unhealthy',
            service: 'auth-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        }, 503, corsHeaders );
    }
}

// Register endpoint
async function handleRegister( request, env, corsHeaders ) {
    try {
        const { name, email, password } = await request.json();

        // Validation
        if ( !name || !email || !password ) {
            return jsonResponse( {
                success: false,
                error: 'Name, email, and password are required'
            }, 400, corsHeaders );
        }

        if ( password.length < 6 ) {
            return jsonResponse( {
                success: false,
                error: 'Password must be at least 6 characters'
            }, 400, corsHeaders );
        }

        // Check if user already exists
        const existingUser = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ?'
        ).bind( email ).first();

        if ( existingUser ) {
            return jsonResponse( {
                success: false,
                error: 'User already exists with this email'
            }, 400, corsHeaders );
        }

        // Hash password (simplified - in production use proper hashing)
        const passwordHash = await simpleHash( password );

        // Generate email verification token
        const verificationToken = generateToken();
        const verificationExpires = new Date( Date.now() + 24 * 60 * 60 * 1000 ).toISOString(); // 24 hours

        // Create user
        const result = await env.DB.prepare(
            `INSERT INTO users (name, email, password_hash, email_verification_token, email_verification_expires) 
       VALUES (?, ?, ?, ?, ?)`
        ).bind( name, email, passwordHash, verificationToken, verificationExpires ).run();

        if ( result.success ) {
            // TODO: Send verification email
            console.log( `Email verification token for ${ email }: ${ verificationToken }` );

            // Generate JWT token
            const token = generateJWT( {
                id: result.meta.last_row_id,
                email,
                name
            }, env.JWT_SECRET, env.JWT_EXPIRE );

            return jsonResponse( {
                success: true,
                message: 'User registered successfully. Please check your email for verification.',
                token,
                data: {
                    id: result.meta.last_row_id,
                    name,
                    email,
                    role: 'user',
                    isEmailVerified: false
                }
            }, 201, corsHeaders );
        } else {
            throw new Error( 'Failed to create user' );
        }
    } catch ( error ) {
        console.error( 'Registration error:', error );
        return jsonResponse( {
            success: false,
            error: 'Registration failed'
        }, 500, corsHeaders );
    }
}

// Login endpoint
async function handleLogin( request, env, corsHeaders ) {
    try {
        const { email, password } = await request.json();

        // Validation
        if ( !email || !password ) {
            return jsonResponse( {
                success: false,
                error: 'Email and password are required'
            }, 400, corsHeaders );
        }

        // Find user
        const user = await env.DB.prepare(
            'SELECT * FROM users WHERE email = ?'
        ).bind( email ).first();

        if ( !user ) {
            return jsonResponse( {
                success: false,
                error: 'Invalid credentials'
            }, 401, corsHeaders );
        }

        // Check if account is active
        if ( !user.is_active ) {
            return jsonResponse( {
                success: false,
                error: 'Account has been deactivated'
            }, 401, corsHeaders );
        }

        // Check password (simplified - in production use proper verification)
        const isPasswordValid = await verifyPassword( password, user.password_hash );

        if ( !isPasswordValid ) {
            // Increment login attempts
            await env.DB.prepare(
                'UPDATE users SET login_attempts = login_attempts + 1, last_login_attempt = ? WHERE id = ?'
            ).bind( new Date().toISOString(), user.id ).run();

            return jsonResponse( {
                success: false,
                error: 'Invalid credentials'
            }, 401, corsHeaders );
        }

        // Reset login attempts
        await env.DB.prepare(
            'UPDATE users SET login_attempts = 0, last_login_attempt = NULL WHERE id = ?'
        ).bind( user.id ).run();

        // Generate JWT token
        const token = generateJWT( {
            id: user.id,
            email: user.email,
            name: user.name
        }, env.JWT_SECRET, env.JWT_EXPIRE );

        return jsonResponse( {
            success: true,
            message: 'Login successful',
            token,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: !!user.is_email_verified
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Login error:', error );
        return jsonResponse( {
            success: false,
            error: 'Login failed'
        }, 500, corsHeaders );
    }
}

// Get profile endpoint
async function handleGetProfile( request, env, corsHeaders ) {
    try {
        const authHeader = request.headers.get( 'Authorization' );
        if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) ) {
            return jsonResponse( {
                success: false,
                error: 'No token provided'
            }, 401, corsHeaders );
        }

        const token = authHeader.substring( 7 );
        const decoded = verifyJWT( token, env.JWT_SECRET );

        if ( !decoded ) {
            return jsonResponse( {
                success: false,
                error: 'Invalid token'
            }, 401, corsHeaders );
        }

        const user = await env.DB.prepare(
            'SELECT id, name, email, role, is_email_verified, created_at FROM users WHERE id = ?'
        ).bind( decoded.id ).first();

        if ( !user ) {
            return jsonResponse( {
                success: false,
                error: 'User not found'
            }, 404, corsHeaders );
        }

        return jsonResponse( {
            success: true,
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: !!user.is_email_verified,
                createdAt: user.created_at
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get profile error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get profile'
        }, 500, corsHeaders );
    }
}

// Refresh token endpoint
async function handleRefreshToken( request, env, corsHeaders ) {
    try {
        const authHeader = request.headers.get( 'Authorization' );
        if ( !authHeader || !authHeader.startsWith( 'Bearer ' ) ) {
            return jsonResponse( {
                success: false,
                error: 'No token provided'
            }, 401, corsHeaders );
        }

        const token = authHeader.substring( 7 );
        const decoded = verifyJWT( token, env.JWT_SECRET );

        if ( !decoded ) {
            return jsonResponse( {
                success: false,
                error: 'Invalid token'
            }, 401, corsHeaders );
        }

        // Generate new token
        const newToken = generateJWT( {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
        }, env.JWT_SECRET, env.JWT_EXPIRE );

        return jsonResponse( {
            success: true,
            token: newToken,
            message: 'Token refreshed successfully'
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Refresh token error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to refresh token'
        }, 500, corsHeaders );
    }
}

// Logout endpoint
async function handleLogout( request, env, corsHeaders ) {
    return jsonResponse( {
        success: true,
        message: 'Logged out successfully'
    }, 200, corsHeaders );
}

// Forgot password endpoint
async function handleForgotPassword( request, env, corsHeaders ) {
    try {
        const { email } = await request.json();

        if ( !email ) {
            return jsonResponse( {
                success: false,
                error: 'Email is required'
            }, 400, corsHeaders );
        }

        const user = await env.DB.prepare(
            'SELECT id, email FROM users WHERE email = ?'
        ).bind( email ).first();

        if ( user ) {
            // Generate reset token
            const resetToken = generateToken();
            const resetExpires = new Date( Date.now() + 1 * 60 * 60 * 1000 ).toISOString(); // 1 hour

            await env.DB.prepare(
                'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?'
            ).bind( resetToken, resetExpires, user.id ).run();

            // TODO: Send password reset email
            console.log( `Password reset token for ${ email }: ${ resetToken }` );
        }

        // Always return success to prevent email enumeration
        return jsonResponse( {
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent'
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Forgot password error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to process request'
        }, 500, corsHeaders );
    }
}

// Verify email endpoint
async function handleVerifyEmail( request, env, corsHeaders, path ) {
    try {
        const token = path.split( '/' ).pop();

        const user = await env.DB.prepare(
            'SELECT id FROM users WHERE email_verification_token = ? AND email_verification_expires > ?'
        ).bind( token, new Date().toISOString() ).first();

        if ( !user ) {
            return jsonResponse( {
                success: false,
                error: 'Invalid or expired verification token'
            }, 400, corsHeaders );
        }

        await env.DB.prepare(
            'UPDATE users SET is_email_verified = 1, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?'
        ).bind( user.id ).run();

        return jsonResponse( {
            success: true,
            message: 'Email verified successfully'
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Verify email error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to verify email'
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

// Simplified password hashing (in production use proper bcrypt)
async function simpleHash( password ) {
    const encoder = new TextEncoder();
    const data = encoder.encode( password );
    const hash = await crypto.subtle.digest( 'SHA-256', data );
    return Array.from( new Uint8Array( hash ) )
        .map( b => b.toString( 16 ).padStart( 2, '0' ) )
        .join( '' );
}

async function verifyPassword( password, hash ) {
    const newHash = await simpleHash( password );
    return newHash === hash;
}

function generateToken() {
    return Array.from( crypto.getRandomValues( new Uint8Array( 32 ) ) )
        .map( b => b.toString( 16 ).padStart( 2, '0' ) )
        .join( '' );
}

// Simplified JWT implementation
function generateJWT( payload, secret, expiresIn ) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor( Date.now() / 1000 );
    const exp = now + ( parseInt( expiresIn ) || 30 * 24 * 60 * 60 ); // Default 30 days

    payload.iat = now;
    payload.exp = exp;

    const headerBase64 = btoa( JSON.stringify( header ) );
    const payloadBase64 = btoa( JSON.stringify( payload ) );
    const signature = simpleHMAC( `${ headerBase64 }.${ payloadBase64 }`, secret );

    return `${ headerBase64 }.${ payloadBase64 }.${ signature }`;
}

function verifyJWT( token, secret ) {
    try {
        const [ headerBase64, payloadBase64, signature ] = token.split( '.' );
        const expectedSignature = simpleHMAC( `${ headerBase64 }.${ payloadBase64 }`, secret );

        if ( signature !== expectedSignature ) {
            return null;
        }

        const payload = JSON.parse( atob( payloadBase64 ) );
        const now = Math.floor( Date.now() / 1000 );

        if ( payload.exp < now ) {
            return null;
        }

        return payload;
    } catch ( error ) {
        return null;
    }
}

function simpleHMAC( data, secret ) {
    // Simplified HMAC implementation
    const encoder = new TextEncoder();
    const keyData = encoder.encode( secret );
    const messageData = encoder.encode( data );

    // This is a simplified version - in production use proper HMAC
    let result = '';
    for ( let i = 0; i < Math.min( keyData.length, messageData.length ); i++ ) {
        result += ( keyData[ i ] ^ messageData[ i ] ).toString( 16 ).padStart( 2, '0' );
    }
    return result;
}
