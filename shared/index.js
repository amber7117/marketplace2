/**
 * Shared Module Main Export
 * Central exports for all shared utilities
 */

// Currency
const currencies = require( './config/currencies' );
const exchangeRates = require( './config/exchangeRates' );

// Region
const regions = require( './config/regions' );

// i18n
const i18n = require( './i18n' );
const i18nMiddleware = require( './i18n/middleware' );

// Middleware
const regionMiddleware = require( './middleware/detectRegion' );
const languageMiddleware = require( './middleware/detectLanguage' );

module.exports = {
    // Currency exports
    Currency: {
        ...currencies,
        convert: exchangeRates.convert,
        getExchangeRate: exchangeRates.getExchangeRate,
        updateExchangeRates: exchangeRates.updateExchangeRates,
        startAutoUpdate: exchangeRates.startAutoUpdate,
        stopAutoUpdate: exchangeRates.stopAutoUpdate,
        getAllRates: exchangeRates.getAllRates,
        getLastUpdate: exchangeRates.getLastUpdate,
    },

    // Region exports
    Region: {
        ...regions,
    },

    // i18n exports
    i18n: i18n.i18next,
    translate: i18n.translate,
    getTranslator: i18n.getTranslator,
    supportedLanguages: i18n.supportedLanguages,
    defaultLanguage: i18n.defaultLanguage,

    // Middleware exports
    detectRegion: regionMiddleware.detectRegionMiddleware,
    requireRegion: regionMiddleware.requireRegion,
    addRegionToResponse: regionMiddleware.addRegionToResponse,

    detectLanguage: languageMiddleware.detectLanguageMiddleware,
    requireLanguage: languageMiddleware.requireLanguage,
    addLanguageToResponse: languageMiddleware.addLanguageToResponse,

    i18nMiddleware: i18nMiddleware.i18nMiddleware,
    languageDetector: i18nMiddleware.languageDetector,
    languageResponseHelper: i18nMiddleware.languageResponseHelper,
};
