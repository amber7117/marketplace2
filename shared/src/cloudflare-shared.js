/**
 * Cloudflare-compatible Shared Service
 * Simplified version for Cloudflare Workers environment
 */

// Currency configurations
const currencies = {
    MYR: { code: 'MYR', symbol: 'RM', decimalPlaces: 2, name: 'Malaysian Ringgit' },
    THB: { code: 'THB', symbol: '฿', decimalPlaces: 2, name: 'Thai Baht' },
    USD: { code: 'USD', symbol: '$', decimalPlaces: 2, name: 'US Dollar' },
    VND: { code: 'VND', symbol: '₫', decimalPlaces: 0, name: 'Vietnamese Dong' },
    PHP: { code: 'PHP', symbol: '₱', decimalPlaces: 2, name: 'Philippine Peso' }
};

// Region configurations
const regions = {
    MY: {
        code: 'MY',
        name: 'Malaysia',
        currency: 'MYR',
        languages: [ 'en', 'my', 'cn' ],
        timezone: 'Asia/Kuala_Lumpur',
        taxRate: 0,
        paymentGateways: [ 'fpx', 'razer_gold', 'stripe' ]
    },
    TH: {
        code: 'TH',
        name: 'Thailand',
        currency: 'THB',
        languages: [ 'en', 'th' ],
        timezone: 'Asia/Bangkok',
        taxRate: 0,
        paymentGateways: [ 'promptpay', 'stripe' ]
    },
    US: {
        code: 'US',
        name: 'United States',
        currency: 'USD',
        languages: [ 'en' ],
        timezone: 'America/New_York',
        taxRate: 0,
        paymentGateways: [ 'stripe', 'paypal' ]
    },
    VN: {
        code: 'VN',
        name: 'Vietnam',
        currency: 'VND',
        languages: [ 'en', 'vi' ],
        timezone: 'Asia/Ho_Chi_Minh',
        taxRate: 0,
        paymentGateways: [ 'momo', 'zalopay', 'stripe' ]
    },
    PH: {
        code: 'PH',
        name: 'Philippines',
        currency: 'PHP',
        languages: [ 'en' ],
        timezone: 'Asia/Manila',
        taxRate: 0,
        paymentGateways: [ 'gcash', 'paymaya', 'stripe' ]
    }
};

// Translation data (simplified for Cloudflare Workers)
const translations = {
    en: {
        welcome: 'Welcome',
        product: {
            not_found: 'Product not found',
            out_of_stock: 'Out of stock'
        }
    },
    th: {
        welcome: 'ยินดีต้อนรับ',
        product: {
            not_found: 'ไม่พบสินค้า',
            out_of_stock: 'สินค้าหมด'
        }
    },
    my: {
        welcome: 'Selamat datang',
        product: {
            not_found: 'Produk tidak dijumpai',
            out_of_stock: 'Stok habis'
        }
    },
    cn: {
        welcome: '欢迎',
        product: {
            not_found: '产品未找到',
            out_of_stock: '缺货'
        }
    },
    vi: {
        welcome: 'Chào mừng',
        product: {
            not_found: 'Không tìm thấy sản phẩm',
            out_of_stock: 'Hết hàng'
        }
    }
};

// Currency conversion (simplified - would need external API)
class CurrencyService {
    static exchangeRates = {
        USD: { MYR: 4.7, THB: 36.5, VND: 23500, PHP: 56.8 },
        MYR: { USD: 0.21, THB: 7.8, VND: 5000, PHP: 12.1 },
        THB: { USD: 0.027, MYR: 0.13, VND: 644, PHP: 1.56 },
        VND: { USD: 0.000043, MYR: 0.0002, THB: 0.00155, PHP: 0.0024 },
        PHP: { USD: 0.0176, MYR: 0.083, THB: 0.64, VND: 416 }
    };

    static async convert( amount, from, to ) {
        if ( from === to ) return amount;

        const rate = this.exchangeRates[ from ]?.[ to ];
        if ( !rate ) {
            throw new Error( `Exchange rate not available for ${ from } to ${ to }` );
        }

        return amount * rate;
    }

    static getExchangeRate( from, to ) {
        if ( from === to ) return 1;
        return this.exchangeRates[ from ]?.[ to ] || null;
    }

    static format( amount, currencyCode ) {
        const currency = currencies[ currencyCode ];
        if ( !currency ) return `${ amount }`;

        const formatted = new Intl.NumberFormat( 'en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: currency.decimalPlaces,
            maximumFractionDigits: currency.decimalPlaces
        } ).format( amount );

        return formatted;
    }

    static isValidCurrency( code ) {
        return !!currencies[ code ];
    }

    static getAllCurrencies() {
        return currencies;
    }

    static getSupportedCurrencies() {
        return Object.keys( currencies );
    }

    static getCurrency( code ) {
        return currencies[ code ];
    }
}

// Region service
class RegionService {
    static getAllRegions() {
        return regions;
    }

    static getSupportedRegions() {
        return Object.keys( regions );
    }

    static getRegion( code ) {
        return regions[ code ];
    }

    static isValidRegion( code ) {
        return !!regions[ code ];
    }

    static getPaymentGateways( regionCode ) {
        return regions[ regionCode ]?.paymentGateways || [];
    }

    static getTaxRate( regionCode ) {
        return regions[ regionCode ]?.taxRate || 0;
    }
}

// i18n service
class I18nService {
    static supportedLanguages = [ 'en', 'th', 'my', 'cn', 'vi' ];
    static defaultLanguage = 'en';

    static translate( key, options = {} ) {
        const language = options.lng || this.defaultLanguage;
        const keys = key.split( '.' );
        let translation = translations[ language ];

        for ( const k of keys ) {
            translation = translation?.[ k ];
            if ( !translation ) break;
        }

        return translation || key;
    }

    static getLanguageName( lng ) {
        const names = {
            en: 'English',
            th: 'ไทย',
            my: 'Bahasa Melayu',
            cn: '中文',
            vi: 'Tiếng Việt',
        };
        return names[ lng ] || 'Unknown';
    }

    static isLanguageSupported( lng ) {
        return this.supportedLanguages.includes( lng );
    }

    static detectLanguage( acceptLanguage ) {
        if ( !acceptLanguage ) return this.defaultLanguage;

        const languages = acceptLanguage
            .split( ',' )
            .map( lang => {
                const [ code, q = '1.0' ] = lang.trim().split( ';q=' );
                return {
                    code: code.split( '-' )[ 0 ].toLowerCase(),
                    quality: parseFloat( q ),
                };
            } )
            .sort( ( a, b ) => b.quality - a.quality );

        for ( const lang of languages ) {
            if ( this.isLanguageSupported( lang.code ) ) {
                return lang.code;
            }
        }

        return this.defaultLanguage;
    }
}

// Export the services
export {
    CurrencyService as Currency,
    RegionService as Region,
    I18nService as i18n,
    translations,
    currencies,
    regions
};

export default {
    Currency: CurrencyService,
    Region: RegionService,
    i18n: I18nService,
    translate: I18nService.translate.bind( I18nService ),
    supportedLanguages: I18nService.supportedLanguages,
    defaultLanguage: I18nService.defaultLanguage
};
