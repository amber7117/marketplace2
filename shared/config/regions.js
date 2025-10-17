/**
 * Region Configuration
 * Supported regions: MY (Malaysia), TH (Thailand), US (United States), VN (Vietnam), PH (Philippines)
 */

const regions = {
    MY: {
        code: 'MY',
        name: 'Malaysia',
        currency: 'MYR',
        languages: [ 'en', 'my', 'cn' ],
        defaultLanguage: 'en',
        timezone: 'Asia/Kuala_Lumpur',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        weekStart: 1, // Monday

        // Business settings
        taxRate: 0.00, // No tax
        taxName: 'SST',

        // Payment gateways available
        paymentGateways: [ 'fpx', 'razer_gold', 'stripe', 'usdt' ],

        // Contact info
        phonePrefix: '+60',
        phoneFormat: '01X-XXX XXXX',

        // Address format
        addressFormat: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
        },

        active: true,
    },

    TH: {
        code: 'TH',
        name: 'Thailand',
        currency: 'THB',
        languages: [ 'en', 'th' ],
        defaultLanguage: 'th',
        timezone: 'Asia/Bangkok',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        weekStart: 0, // Sunday

        // Business settings
        taxRate: 0.07, // 7% VAT
        taxName: 'VAT',

        // Payment gateways available
        paymentGateways: [ 'stripe', 'razer_gold', 'usdt' ],

        // Contact info
        phonePrefix: '+66',
        phoneFormat: '0X-XXXX-XXXX',

        // Address format
        addressFormat: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
        },

        active: true,
    },

    US: {
        code: 'US',
        name: 'United States',
        currency: 'USD',
        languages: [ 'en' ],
        defaultLanguage: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        weekStart: 0, // Sunday

        // Business settings
        taxRate: 0.00, // Varies by state, set to 0 for digital goods
        taxName: 'Sales Tax',

        // Payment gateways available
        paymentGateways: [ 'stripe', 'usdt' ],

        // Contact info
        phonePrefix: '+1',
        phoneFormat: '(XXX) XXX-XXXX',

        // Address format
        addressFormat: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
        },

        active: true,
    },

    VN: {
        code: 'VN',
        name: 'Vietnam',
        currency: 'VND',
        languages: [ 'en', 'vi' ],
        defaultLanguage: 'vi',
        timezone: 'Asia/Ho_Chi_Minh',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        weekStart: 1, // Monday

        // Business settings
        taxRate: 0.10, // 10% VAT
        taxName: 'VAT',

        // Payment gateways available
        paymentGateways: [ 'stripe', 'razer_gold', 'usdt' ],

        // Contact info
        phonePrefix: '+84',
        phoneFormat: '0XX XXX XXXX',

        // Address format
        addressFormat: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
        },

        active: true,
    },

    PH: {
        code: 'PH',
        name: 'Philippines',
        currency: 'PHP',
        languages: [ 'en' ],
        defaultLanguage: 'en',
        timezone: 'Asia/Manila',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        weekStart: 0, // Sunday

        // Business settings
        taxRate: 0.12, // 12% VAT
        taxName: 'VAT',

        // Payment gateways available
        paymentGateways: [ 'stripe', 'razer_gold', 'usdt' ],

        // Contact info
        phonePrefix: '+63',
        phoneFormat: '09XX XXX XXXX',

        // Address format
        addressFormat: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
        },

        active: true,
    },

    // Global/International fallback
    GLOBAL: {
        code: 'GLOBAL',
        name: 'International',
        currency: 'USD',
        languages: [ 'en' ],
        defaultLanguage: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        weekStart: 1,
        taxRate: 0.00,
        taxName: 'Tax',
        paymentGateways: [ 'stripe', 'usdt' ],
        phonePrefix: '+',
        phoneFormat: 'XXXXXXXXXXXX',
        addressFormat: {
            line1: true,
            line2: true,
            city: true,
            state: true,
            postalCode: true,
            country: true,
        },
        active: true,
    },
};

/**
 * Get region configuration
 * @param {string} code - Region code (MY, TH, US, VN, PH)
 * @returns {Object|null} Region configuration
 */
function getRegion( code ) {
    const upperCode = code?.toUpperCase();
    return regions[ upperCode ] || null;
}

/**
 * Get all active regions
 * @returns {Array} Array of region objects
 */
function getAllRegions() {
    return Object.values( regions ).filter( r => r.active && r.code !== 'GLOBAL' );
}

/**
 * Validate region code
 * @param {string} code - Region code to validate
 * @returns {boolean} True if valid
 */
function isValidRegion( code ) {
    const upperCode = code?.toUpperCase();
    return regions[ upperCode ]?.active === true;
}

/**
 * Get payment gateways for region
 * @param {string} regionCode - Region code
 * @returns {Array} Array of payment gateway codes
 */
function getPaymentGateways( regionCode ) {
    const region = getRegion( regionCode );
    return region?.paymentGateways || [];
}

/**
 * Get tax rate for region
 * @param {string} regionCode - Region code
 * @returns {number} Tax rate (0.00 - 1.00)
 */
function getTaxRate( regionCode ) {
    const region = getRegion( regionCode );
    return region?.taxRate || 0.00;
}

/**
 * Calculate tax amount
 * @param {number} amount - Base amount
 * @param {string} regionCode - Region code
 * @returns {number} Tax amount
 */
function calculateTax( amount, regionCode ) {
    const taxRate = getTaxRate( regionCode );
    return amount * taxRate;
}

/**
 * Calculate total with tax
 * @param {number} amount - Base amount
 * @param {string} regionCode - Region code
 * @returns {Object} { subtotal, tax, total }
 */
function calculateTotal( amount, regionCode ) {
    const tax = calculateTax( amount, regionCode );
    return {
        subtotal: amount,
        tax: tax,
        total: amount + tax,
    };
}

/**
 * Get supported languages for region
 * @param {string} regionCode - Region code
 * @returns {Array} Array of language codes
 */
function getLanguages( regionCode ) {
    const region = getRegion( regionCode );
    return region?.languages || [ 'en' ];
}

/**
 * Get default language for region
 * @param {string} regionCode - Region code
 * @returns {string} Language code
 */
function getDefaultLanguage( regionCode ) {
    const region = getRegion( regionCode );
    return region?.defaultLanguage || 'en';
}

/**
 * Detect region from country code or IP
 * @param {string} countryCode - ISO country code
 * @returns {string} Region code
 */
function detectRegion( countryCode ) {
    const upperCode = countryCode?.toUpperCase();

    // Direct mapping
    if ( regions[ upperCode ]?.active ) {
        return upperCode;
    }

    // Singapore uses MYR
    if ( upperCode === 'SG' ) {
        return 'MY';
    }

    // Default to GLOBAL
    return 'GLOBAL';
}

/**
 * Get region by currency
 * @param {string} currencyCode - Currency code
 * @returns {Object|null} First region using this currency
 */
function getRegionByCurrency( currencyCode ) {
    const upperCode = currencyCode?.toUpperCase();
    const region = Object.values( regions ).find(
        r => r.active && r.currency === upperCode
    );
    return region || null;
}

/**
 * Format phone number according to region
 * @param {string} phoneNumber - Phone number
 * @param {string} regionCode - Region code
 * @returns {string} Formatted phone number
 */
function formatPhoneNumber( phoneNumber, regionCode ) {
    const region = getRegion( regionCode );
    if ( !region ) return phoneNumber;

    // Remove all non-digits
    const digits = phoneNumber.replace( /\D/g, '' );

    // Add prefix if not present
    const prefix = region.phonePrefix.replace( '+', '' );
    if ( !digits.startsWith( prefix ) ) {
        return `${ region.phonePrefix }${ digits }`;
    }

    return `+${ digits }`;
}

/**
 * Validate payment gateway for region
 * @param {string} gateway - Payment gateway code
 * @param {string} regionCode - Region code
 * @returns {boolean} True if gateway is supported
 */
function isGatewaySupported( gateway, regionCode ) {
    const gateways = getPaymentGateways( regionCode );
    return gateways.includes( gateway.toLowerCase() );
}

module.exports = {
    regions,
    getRegion,
    getAllRegions,
    isValidRegion,
    getPaymentGateways,
    getTaxRate,
    calculateTax,
    calculateTotal,
    getLanguages,
    getDefaultLanguage,
    detectRegion,
    getRegionByCurrency,
    formatPhoneNumber,
    isGatewaySupported,
};
