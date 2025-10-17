const NotificationTemplate = require( '../models/NotificationTemplate' );

/**
 * @desc    Get all templates
 * @route   GET /api/notifications/templates
 * @access  Private (Admin)
 */
exports.getTemplates = async ( req, res ) => {
    try {
        const { type, channel, isActive } = req.query;

        const query = {};
        if ( type ) query.type = type;
        if ( channel ) query.channel = channel;
        if ( isActive !== undefined ) query.isActive = isActive === 'true';

        const templates = await NotificationTemplate.find( query ).sort( { name: 1 } );

        res.json( {
            success: true,
            data: templates,
            count: templates.length,
        } );
    } catch ( error ) {
        console.error( 'Get templates error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch templates',
        } );
    }
};

/**
 * @desc    Get template by name
 * @route   GET /api/notifications/templates/:name
 * @access  Private (Admin)
 */
exports.getTemplate = async ( req, res ) => {
    try {
        const { name } = req.params;

        const template = await NotificationTemplate.findOne( { name } );

        if ( !template ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Template not found',
            } );
        }

        res.json( {
            success: true,
            data: template,
        } );
    } catch ( error ) {
        console.error( 'Get template error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to fetch template',
        } );
    }
};

/**
 * @desc    Create template
 * @route   POST /api/notifications/templates
 * @access  Private (Admin)
 */
exports.createTemplate = async ( req, res ) => {
    try {
        const template = new NotificationTemplate( req.body );
        await template.save();

        res.status( 201 ).json( {
            success: true,
            data: template,
            message: 'Template created successfully',
        } );
    } catch ( error ) {
        console.error( 'Create template error:', error );

        if ( error.code === 11000 ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Template with this name already exists',
            } );
        }

        res.status( 500 ).json( {
            success: false,
            error: 'Failed to create template',
            details: error.message,
        } );
    }
};

/**
 * @desc    Update template
 * @route   PUT /api/notifications/templates/:name
 * @access  Private (Admin)
 */
exports.updateTemplate = async ( req, res ) => {
    try {
        const { name } = req.params;

        const template = await NotificationTemplate.findOneAndUpdate(
            { name },
            req.body,
            { new: true, runValidators: true }
        );

        if ( !template ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Template not found',
            } );
        }

        res.json( {
            success: true,
            data: template,
            message: 'Template updated successfully',
        } );
    } catch ( error ) {
        console.error( 'Update template error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to update template',
            details: error.message,
        } );
    }
};

/**
 * @desc    Delete template
 * @route   DELETE /api/notifications/templates/:name
 * @access  Private (Admin)
 */
exports.deleteTemplate = async ( req, res ) => {
    try {
        const { name } = req.params;

        const template = await NotificationTemplate.findOneAndDelete( { name } );

        if ( !template ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Template not found',
            } );
        }

        res.json( {
            success: true,
            message: 'Template deleted successfully',
        } );
    } catch ( error ) {
        console.error( 'Delete template error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to delete template',
        } );
    }
};

/**
 * @desc    Test template rendering
 * @route   POST /api/notifications/templates/:name/test
 * @access  Private (Admin)
 */
exports.testTemplate = async ( req, res ) => {
    try {
        const { name } = req.params;
        const { data } = req.body;

        const template = await NotificationTemplate.findOne( { name } );

        if ( !template ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Template not found',
            } );
        }

        // Validate template data
        const validation = template.validateData( data );

        if ( !validation.valid ) {
            return res.status( 400 ).json( {
                success: false,
                error: 'Template data validation failed',
                details: validation.errors,
            } );
        }

        // Render template
        const rendered = template.render( data );

        res.json( {
            success: true,
            rendered,
        } );
    } catch ( error ) {
        console.error( 'Test template error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to test template',
            details: error.message,
        } );
    }
};

/**
 * @desc    Toggle template active status
 * @route   PUT /api/notifications/templates/:name/toggle
 * @access  Private (Admin)
 */
exports.toggleTemplate = async ( req, res ) => {
    try {
        const { name } = req.params;

        const template = await NotificationTemplate.findOne( { name } );

        if ( !template ) {
            return res.status( 404 ).json( {
                success: false,
                error: 'Template not found',
            } );
        }

        template.isActive = !template.isActive;
        await template.save();

        res.json( {
            success: true,
            data: template,
            message: `Template ${ template.isActive ? 'activated' : 'deactivated' }`,
        } );
    } catch ( error ) {
        console.error( 'Toggle template error:', error );
        res.status( 500 ).json( {
            success: false,
            error: 'Failed to toggle template',
        } );
    }
};
