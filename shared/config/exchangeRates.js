/**
 * Exchange Rate Manager
 * Manages currency conversion with real-time exchange rates
 */

const axios = require( 'axios' );

// Base currency for exchange rates
const BASE_CURRENCY = 'USD';

// Default exchange rates (fallback)
let exchangeRates = {
    USD: 1.0,
    MYR: 4.72,    // 1 USD = 4.72 MYR (approximate)
    THB: 35.80,   // 1 USD = 35.80 THB
    VND: 24500,   // 1 USD = 24,500 VND
    PHP: 56.50,   // 1 USD = 56.50 PHP
};

let lastUpdate = new Date();
let updateInterval = null;

/**
 * Update exchange rates from API
 * Using exchangerate-api.com (free tier)
 */
async function updateExchangeRates() {
    try {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;

        if ( !apiKey ) {
            console.warn( 'EXCHANGE_RATE_API_KEY not set, using default rates' );
            return false;
        }

        const response = await axios.get(
            `https://v6.exchangerate-api.com/v6/${ apiKey }/latest/${ BASE_CURRENCY }`,
            { timeout: 10000 }
        );

        if ( response.data.result === 'success' ) {
            const rates = response.data.conversion_rates;

            // Update only supported currencies
            exchangeRates = {
                USD: rates.USD || 1.0,
                MYR: rates.MYR || exchangeRates.MYR,
                THB: rates.THB || exchangeRates.THB,
                VND: rates.VND || exchangeRates.VND,
                PHP: rates.PHP || exchangeRates.PHP,
            };

            lastUpdate = new Date();
            console.log( `Exchange rates updated successfully at ${ lastUpdate.toISOString() }` );
            return true;
        }

        return false;
    } catch ( error ) {
        console.error( 'Failed to update exchange rates:', error.message );
        return false;
    }
}

/**
 * Get current exchange rate
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Exchange rate
 */
function getExchangeRate( fromCurrency, toCurrency ) {
    const from = fromCurrency.toUpperCase();
    const to = toCurrency.toUpperCase();

    if ( from === to ) return 1.0;

    if ( !exchangeRates[ from ] || !exchangeRates[ to ] ) {
        throw new Error( `Exchange rate not available for ${ from } to ${ to }` );
    }

    // Convert through USD as base
    // Example: MYR to THB = (1 / MYR_to_USD) * USD_to_THB
    const rate = exchangeRates[ to ] / exchangeRates[ from ];
    return rate;
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @param {string} toCurrency - Target currency code
 * @returns {number} Converted amount
 */
function convert( amount, fromCurrency, toCurrency ) {
    if ( amount < 0 ) {
        throw new Error( 'Amount cannot be negative' );
    }

    const rate = getExchangeRate( fromCurrency, toCurrency );
    return amount * rate;
}

/**
 * Get all current exchange rates
 * @returns {Object} Exchange rates object
 */
function getAllRates() {
    return { ...exchangeRates };
}

/**
 * Get last update timestamp
 * @returns {Date} Last update date
 */
function getLastUpdate() {
    return lastUpdate;
}

/**
 * Start automatic exchange rate updates
 * @param {number} intervalMs - Update interval in milliseconds (default: 1 hour)
 */
function startAutoUpdate( intervalMs = 3600000 ) {
    if ( updateInterval ) {
        clearInterval( updateInterval );
    }

    // Update immediately
    updateExchangeRates();

    // Then update periodically
    updateInterval = setInterval( () => {
        updateExchangeRates();
    }, intervalMs );

    console.log( `Exchange rate auto-update started (interval: ${ intervalMs }ms)` );
}

/**
 * Stop automatic exchange rate updates
 */
function stopAutoUpdate() {
    if ( updateInterval ) {
        clearInterval( updateInterval );
        updateInterval = null;
        console.log( 'Exchange rate auto-update stopped' );
    }
}

/**
 * Manually set exchange rates (for testing)
 * @param {Object} rates - Exchange rates object
 */
function setRates( rates ) {
    exchangeRates = { ...rates };
    lastUpdate = new Date();
}

module.exports = {
    updateExchangeRates,
    getExchangeRate,
    convert,
    getAllRates,
    getLastUpdate,
    startAutoUpdate,
    stopAutoUpdate,
    setRates,
    BASE_CURRENCY,
};
