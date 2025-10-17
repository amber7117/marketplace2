const express = require( 'express' );
const router = express.Router();
const {
    getTemplates,
    getTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    testTemplate,
    toggleTemplate,
} = require( '../controllers/templateController' );
const { body } = require( 'express-validator' );
const { validate } = require( '../middleware/validator' );
const authMiddleware = require( '../middleware/auth' );

// All routes require authentication (admin)
router.use( authMiddleware );

// Get all templates
router.get( '/', getTemplates );

// Get template by name
router.get( '/:name', getTemplate );

// Create template
router.post(
    '/',
    [
        body( 'name' ).isString().notEmpty().withMessage( 'Name is required' ),
        body( 'type' ).isString().notEmpty().withMessage( 'Type is required' ),
        body( 'channel' ).isString().notEmpty().withMessage( 'Channel is required' ),
        body( 'subject' ).isString().notEmpty().withMessage( 'Subject is required' ),
        validate,
    ],
    createTemplate
);

// Update template
router.put( '/:name', updateTemplate );

// Delete template
router.delete( '/:name', deleteTemplate );

// Test template rendering
router.post(
    '/:name/test',
    [
        body( 'data' ).isObject().withMessage( 'Template data must be an object' ),
        validate,
    ],
    testTemplate
);

// Toggle template active status
router.put( '/:name/toggle', toggleTemplate );

module.exports = router;
