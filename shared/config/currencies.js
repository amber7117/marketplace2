/**
 * Currency Configuration
 * Supported currencies: MYR, THB, USD, VND, PHP
 */

const currencies = {
    MYR: {
        code: 'MYR',
        name: 'Malaysian Ringgit',
        symbol: 'RM',
        symbolNative: 'RM',
        decimalPlaces: 2,
        rounding: 0.01,
        regions: [ 'MY', 'SG' ],
        active: true,
    },
    THB: {
        code: 'THB',
        name: 'Thai Baht',
        symbol: '฿',
        symbolNative: '฿',
        decimalPlaces: 2,
        rounding: 0.01,
        regions: [ 'TH' ],
        active: true,
    },
    USD: {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        symbolNative: '$',
        decimalPlaces: 2,
        rounding: 0.01,
        regions: [ 'US', 'GLOBAL' ],
        active: true,
    },
    VND: {
        code: 'VND',
        name: 'Vietnamese Dong',
        symbol: '₫',
        symbolNative: '₫',
        decimalPlaces: 0,
        rounding: 1,
        regions: [ 'VN' ],
        active: true,
    },
    PHP: {
        code: 'PHP',
        name: 'Philippine Peso',
        symbol: '₱',
        symbolNative: '₱',
        decimalPlaces: 2,
        rounding: 0.01,
        regions: [ 'PH' ],
        active: true,
    },
};

/**
 * Get currency configuration
 * @param {string} code - Currency code (MYR, THB, USD, VND, PHP)
 * @returns {Object|null} Currency configuration
 */
function getCurrency( code ) {
    const upperCode = code?.toUpperCase();
    return currencies[ upperCode ] || null;
}

/**
 * Get all active currencies
 * @returns {Array} Array of currency objects
 */
function getAllCurrencies() {
    return Object.values( currencies ).filter( c => c.active );
}

/**
 * Get currencies for a specific region
 * @param {string} regionCode - Region code (MY, TH, US, VN, PH)
 * @returns {Array} Array of currency objects
 */
function getCurrenciesForRegion( regionCode ) {
    const upperRegion = regionCode?.toUpperCase();
    return Object.values( currencies ).filter(
        c => c.active && c.regions.includes( upperRegion )
    );
}

/**
 * Validate currency code
 * @param {string} code - Currency code to validate
 * @returns {boolean} True if valid
 */
function isValidCurrency( code ) {
    const upperCode = code?.toUpperCase();
    return currencies[ upperCode ]?.active === true;
}

/**
 * Round amount according to currency rules
 * @param {number} amount - Amount to round
 * @param {string} currencyCode - Currency code
 * @returns {number} Rounded amount
 */
function roundAmount( amount, currencyCode ) {
    const currency = getCurrency( currencyCode );
    if ( !currency ) {
        throw new Error( `Invalid currency code: ${ currencyCode }` );
    }

    const factor = 1 / currency.rounding;
    return Math.round( amount * factor ) / factor;
}

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currencyCode - Currency code
 * @param {string} locale - Locale for formatting (optional)
 * @returns {string} Formatted amount
 */
function formatAmount( amount, currencyCode, locale = 'en-US' ) {
    const currency = getCurrency( currencyCode );
    if ( !currency ) {
        throw new Error( `Invalid currency code: ${ currencyCode }` );
    }

    // Round according to currency rules
    const rounded = roundAmount( amount, currencyCode );

    // Format with locale
    const formatted = new Intl.NumberFormat( locale, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: currency.decimalPlaces,
        maximumFractionDigits: currency.decimalPlaces,
    } ).format( rounded );

    return formatted;
}

/**
 * Parse formatted currency string to number
 * @param {string} formattedAmount - Formatted currency string
 * @param {string} currencyCode - Currency code
 * @returns {number} Numeric amount
 */
function parseAmount( formattedAmount, currencyCode ) {
    const currency = getCurrency( currencyCode );
    if ( !currency ) {
        throw new Error( `Invalid currency code: ${ currencyCode }` );
    }

    // Remove currency symbol and spaces
    const cleaned = formattedAmount
        .replace( currency.symbol, '' )
        .replace( currency.symbolNative, '' )
        .replace( /\s/g, '' )
        .replace( /,/g, '' );

    const amount = parseFloat( cleaned );
    if ( isNaN( amount ) ) {
        throw new Error( `Invalid amount: ${ formattedAmount }` );
    }

    return roundAmount( amount, currencyCode );
}

/**
 * Compare two amounts considering currency precision
 * @param {number} amount1 - First amount
 * @param {number} amount2 - Second amount
 * @param {string} currencyCode - Currency code
 * @returns {number} -1, 0, or 1
 */
function compareAmounts( amount1, amount2, currencyCode ) {
    const rounded1 = roundAmount( amount1, currencyCode );
    const rounded2 = roundAmount( amount2, currencyCode );

    if ( rounded1 < rounded2 ) return -1;
    if ( rounded1 > rounded2 ) return 1;
    return 0;
}

module.exports = {
    currencies,
    getCurrency,
    getAllCurrencies,
    getCurrenciesForRegion,
    isValidCurrency,
    roundAmount,
    formatAmount,
    parseAmount,
    compareAmounts,
};
