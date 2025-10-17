/**
 * Cloudflare Worker for Notification Service
 * Notification management service using Cloudflare D1 database
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
            } else if ( path === '/api/notifications' && request.method === 'POST' ) {
                return handleCreateNotification( request, env, corsHeaders );
            } else if ( path === '/api/notifications' && request.method === 'GET' ) {
                return handleGetNotifications( request, env, corsHeaders );
            } else if ( path === '/api/notifications/process' && request.method === 'POST' ) {
                return handleProcessNotifications( request, env, corsHeaders );
            } else if ( path === '/api/notifications/retry' && request.method === 'POST' ) {
                return handleRetryFailedNotifications( request, env, corsHeaders );
            } else if ( path === '/api/notifications/preferences' && request.method === 'GET' ) {
                return handleGetPreferences( request, env, corsHeaders );
            } else if ( path === '/api/notifications/preferences' && request.method === 'PUT' ) {
                return handleUpdatePreferences( request, env, corsHeaders );
            } else if ( path === '/api/notifications/templates' && request.method === 'GET' ) {
                return handleGetTemplates( request, env, corsHeaders );
            } else {
                return jsonResponse( {
                    error: 'Not found',
                    message: 'Available endpoints: /health, /api/notifications, /api/notifications/process, /api/notifications/retry, /api/notifications/preferences, /api/notifications/templates'
                }, 404, corsHeaders );
            }
        } catch ( error ) {
            console.error( 'Notification Worker error:', error );
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
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        channel TEXT NOT NULL,
        recipient TEXT NOT NULL,
        metadata TEXT,
        sent_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await db.exec( `
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        channel TEXT NOT NULL,
        type TEXT NOT NULL,
        enabled INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, channel, type)
      )
    `);

        await db.exec( `
      CREATE TABLE IF NOT EXISTS notification_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        type TEXT NOT NULL,
        channel TEXT NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        variables TEXT,
        is_active INTEGER DEFAULT 1,
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
            service: 'notification-service',
            timestamp: new Date().toISOString(),
            database: 'connected',
            providers: {
                email: false, // Simplified - would check actual providers
                telegram: false
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        return jsonResponse( {
            status: 'unhealthy',
            service: 'notification-service',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        }, 503, corsHeaders );
    }
}

// Create notification
async function handleCreateNotification( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { type, title, message, channel, recipient, metadata } = await request.json();

        if ( !type || !title || !message || !channel || !recipient ) {
            return jsonResponse( {
                success: false,
                error: 'Type, title, message, channel, and recipient are required'
            }, 400, corsHeaders );
        }

        // Check user preferences
        const preference = await env.DB.prepare(
            'SELECT enabled FROM notification_preferences WHERE user_id = ? AND channel = ? AND type = ?'
        ).bind( userId, channel, type ).first();

        if ( preference && !preference.enabled ) {
            return jsonResponse( {
                success: false,
                error: 'Notification type is disabled for this channel'
            }, 400, corsHeaders );
        }

        // Create notification record
        const result = await env.DB.prepare(
            'INSERT INTO notifications (user_id, type, title, message, channel, recipient, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).bind( userId, type, title, message, channel, recipient, JSON.stringify( metadata || {} ) ).run();

        const notificationId = result.meta.last_row_id;

        return jsonResponse( {
            success: true,
            message: 'Notification created successfully',
            data: {
                id: notificationId,
                type: type,
                title: title,
                message: message,
                channel: channel,
                recipient: recipient,
                status: 'pending'
            }
        }, 201, corsHeaders );
    } catch ( error ) {
        console.error( 'Create notification error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to create notification'
        }, 500, corsHeaders );
    }
}

// Get notifications
async function handleGetNotifications( request, env, corsHeaders ) {
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
        const status = url.searchParams.get( 'status' );

        let query = 'SELECT * FROM notifications WHERE user_id = ?';
        const params = [ userId ];

        if ( status ) {
            query += ' AND status = ?';
            params.push( status );
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push( limit, offset );

        const notifications = await env.DB.prepare( query ).bind( ...params ).all();

        return jsonResponse( {
            success: true,
            data: notifications.results.map( notification => ( {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                channel: notification.channel,
                recipient: notification.recipient,
                status: notification.status,
                metadata: JSON.parse( notification.metadata || '{}' ),
                sentAt: notification.sent_at,
                createdAt: notification.created_at
            } ) )
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get notifications error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get notifications'
        }, 500, corsHeaders );
    }
}

// Process pending notifications
async function handleProcessNotifications( request, env, corsHeaders ) {
    try {
        // This would typically be called by a cron job
        const pendingNotifications = await env.DB.prepare(
            'SELECT * FROM notifications WHERE status = ? LIMIT 10'
        ).bind( 'pending' ).all();

        let processed = 0;
        let failed = 0;

        for ( const notification of pendingNotifications.results ) {
            try {
                // Simulate sending notification
                // In a real implementation, this would integrate with actual providers
                console.log( `Sending ${ notification.channel } notification to ${ notification.recipient }` );

                // Update notification status
                await env.DB.prepare(
                    'UPDATE notifications SET status = ?, sent_at = ?, updated_at = ? WHERE id = ?'
                ).bind( 'sent', new Date().toISOString(), new Date().toISOString(), notification.id ).run();

                processed++;
            } catch ( error ) {
                console.error( `Failed to send notification ${ notification.id }:`, error );
                await env.DB.prepare(
                    'UPDATE notifications SET status = ?, updated_at = ? WHERE id = ?'
                ).bind( 'failed', new Date().toISOString(), notification.id ).run();
                failed++;
            }
        }

        return jsonResponse( {
            success: true,
            message: 'Notifications processed',
            data: {
                processed: processed,
                failed: failed,
                total: pendingNotifications.results.length
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Process notifications error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to process notifications'
        }, 500, corsHeaders );
    }
}

// Retry failed notifications
async function handleRetryFailedNotifications( request, env, corsHeaders ) {
    try {
        const failedNotifications = await env.DB.prepare(
            'SELECT * FROM notifications WHERE status = ? LIMIT 5'
        ).bind( 'failed' ).all();

        let retried = 0;
        let succeeded = 0;

        for ( const notification of failedNotifications.results ) {
            try {
                // Simulate retry
                console.log( `Retrying ${ notification.channel } notification to ${ notification.recipient }` );

                // Update notification status
                await env.DB.prepare(
                    'UPDATE notifications SET status = ?, sent_at = ?, updated_at = ? WHERE id = ?'
                ).bind( 'sent', new Date().toISOString(), new Date().toISOString(), notification.id ).run();

                retried++;
                succeeded++;
            } catch ( error ) {
                console.error( `Failed to retry notification ${ notification.id }:`, error );
                retried++;
            }
        }

        return jsonResponse( {
            success: true,
            message: 'Failed notifications retried',
            data: {
                retried: retried,
                succeeded: succeeded,
                total: failedNotifications.results.length
            }
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Retry notifications error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to retry notifications'
        }, 500, corsHeaders );
    }
}

// Get notification preferences
async function handleGetPreferences( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const preferences = await env.DB.prepare(
            'SELECT * FROM notification_preferences WHERE user_id = ?'
        ).bind( userId ).all();

        return jsonResponse( {
            success: true,
            data: preferences.results.map( pref => ( {
                channel: pref.channel,
                type: pref.type,
                enabled: !!pref.enabled
            } ) )
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get preferences error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get preferences'
        }, 500, corsHeaders );
    }
}

// Update notification preferences
async function handleUpdatePreferences( request, env, corsHeaders ) {
    try {
        const userId = getUserIdFromAuth( request );
        if ( !userId ) {
            return jsonResponse( {
                success: false,
                error: 'Authentication required'
            }, 401, corsHeaders );
        }

        const { channel, type, enabled } = await request.json();

        if ( !channel || !type ) {
            return jsonResponse( {
                success: false,
                error: 'Channel and type are required'
            }, 400, corsHeaders );
        }

        // Upsert preference
        await env.DB.prepare(
            `INSERT INTO notification_preferences (user_id, channel, type, enabled, updated_at) 
       VALUES (?, ?, ?, ?, ?) 
       ON CONFLICT(user_id, channel, type) 
       DO UPDATE SET enabled = ?, updated_at = ?`
        ).bind(
            userId, channel, type, enabled ? 1 : 0, new Date().toISOString(),
            enabled ? 1 : 0, new Date().toISOString()
        ).run();

        return jsonResponse( {
            success: true,
            message: 'Preferences updated successfully'
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Update preferences error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to update preferences'
        }, 500, corsHeaders );
    }
}

// Get notification templates
async function handleGetTemplates( request, env, corsHeaders ) {
    try {
        const templates = await env.DB.prepare(
            'SELECT * FROM notification_templates WHERE is_active = 1'
        ).all();

        return jsonResponse( {
            success: true,
            data: templates.results.map( template => ( {
                id: template.id,
                name: template.name,
                type: template.type,
                channel: template.channel,
                subject: template.subject,
                content: template.content,
                variables: JSON.parse( template.variables || '[]' )
            } ) )
        }, 200, corsHeaders );
    } catch ( error ) {
        console.error( 'Get templates error:', error );
        return jsonResponse( {
            success: false,
            error: 'Failed to get templates'
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
