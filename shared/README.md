# Shared Module - Virtual Trading Platform

Shared utilities, configurations, and middleware for all microservices.

## Features

- 🌍 **Multi-Currency Support**: MYR, THB, USD, VND, PHP with exchange rates
- 🗺️ **Multi-Region Configuration**: Region-specific settings and business rules
- 🌐 **Multi-Language i18n**: EN, TH, MY, CN, VI with automatic detection
- 💱 **Currency Conversion**: Real-time exchange rate updates
- 🎨 **Number Formatting**: Locale-aware currency and number formatting
- 🔧 **Utilities**: Common helpers for all services

## Installation

```bash
npm install
```

## Supported Currencies

| Currency | Code | Symbol | Decimal Places |
|----------|------|--------|----------------|
| Malaysian Ringgit | MYR | RM | 2 |
| Thai Baht | THB | ฿ | 2 |
| US Dollar | USD | $ | 2 |
| Vietnamese Dong | VND | ₫ | 0 |
| Philippine Peso | PHP | ₱ | 2 |

## Supported Regions

| Region | Code | Currency | Languages | Timezone |
|--------|------|----------|-----------|----------|
| Malaysia | MY | MYR | EN, MY, CN | Asia/Kuala_Lumpur |
| Thailand | TH | THB | EN, TH | Asia/Bangkok |
| United States | US | USD | EN | America/New_York |
| Vietnam | VN | VND | EN, VI | Asia/Ho_Chi_Minh |
| Philippines | PH | PHP | EN | Asia/Manila |

## Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| English | en | English |
| Thai | th | ไทย |
| Malay | my | Bahasa Melayu |
| Chinese | cn | 中文 |
| Vietnamese | vi | Tiếng Việt |

## Usage

### Currency Module

```javascript
const { Currency } = require('@trading-platform/shared');

// Get currency info
const myr = Currency.getCurrency('MYR');
console.log(myr); // { code: 'MYR', symbol: 'RM', ... }

// Format amount
const formatted = Currency.format(1234.56, 'MYR');
console.log(formatted); // "RM 1,234.56"

// Convert currency
const converted = await Currency.convert(100, 'USD', 'MYR');
console.log(converted); // ~450 (based on exchange rate)

// Validate currency code
Currency.isValidCurrency('MYR'); // true
Currency.isValidCurrency('ABC'); // false
```

### Region Module

```javascript
const { Region } = require('@trading-platform/shared');

// Get region config
const malaysia = Region.getRegion('MY');
console.log(malaysia.currency); // 'MYR'
console.log(malaysia.languages); // ['en', 'my', 'cn']

// Get payment gateways for region
const gateways = Region.getPaymentGateways('MY');
console.log(gateways); // ['fpx', 'razer_gold', 'stripe']

// Get tax rate
const tax = Region.getTaxRate('MY');
console.log(tax); // 0 (no tax)
```

### i18n Module

```javascript
const { i18n, i18nMiddleware } = require('@trading-platform/shared');

// In Express app
app.use(i18nMiddleware);

// In route handler
app.get('/api/products', (req, res) => {
  const message = req.t('product.not_found');
  res.json({ message });
});

// Manual translation
const translated = i18n.t('welcome', { lng: 'th' });
console.log(translated); // "ยินดีต้อนรับ"
```

### Middleware

```javascript
const { detectRegion, detectLanguage } = require('@trading-platform/shared');

// Auto-detect region from IP or header
app.use(detectRegion);

// Auto-detect language from header
app.use(detectLanguage);

// Access in routes
app.get('/api/user', (req, res) => {
  console.log(req.region); // 'MY'
  console.log(req.currency); // 'MYR'
  console.log(req.language); // 'en'
});
```

## File Structure

```
shared/
├── package.json
├── index.js                    # Main exports
├── config/
│   ├── currencies.js          # Currency definitions
│   ├── regions.js             # Region configurations
│   └── exchangeRates.js       # Exchange rate manager
├── i18n/
│   ├── index.js               # i18n setup
│   ├── middleware.js          # Express middleware
│   └── locales/               # Translation files
│       ├── en.json
│       ├── th.json
│       ├── my.json
│       ├── cn.json
│       └── vi.json
├── utils/
│   ├── currencyFormatter.js   # Currency formatting
│   ├── currencyConverter.js   # Currency conversion
│   ├── regionDetector.js      # Region detection
│   └── validators.js          # Common validators
└── middleware/
    ├── detectRegion.js        # Region detection middleware
    └── detectLanguage.js      # Language detection middleware
```

## Environment Variables

```env
# Currency API (for exchange rates)
EXCHANGE_RATE_API_KEY=your-api-key
EXCHANGE_RATE_UPDATE_INTERVAL=3600000  # 1 hour in ms

# Default settings
DEFAULT_CURRENCY=USD
DEFAULT_REGION=US
DEFAULT_LANGUAGE=en
```

## Exchange Rate Updates

Exchange rates are updated automatically every hour. You can also trigger manual updates:

```javascript
const { Currency } = require('@trading-platform/shared');

// Manual update
await Currency.updateExchangeRates();

// Get last update time
const lastUpdate = Currency.getLastUpdate();
console.log(lastUpdate);
```

## Integration Examples

### Product Service

```javascript
// In product-service
const { Currency, i18n } = require('@trading-platform/shared');

// Store prices in multiple currencies
const product = {
  name: 'Steam Gift Card',
  prices: {
    USD: 10,
    MYR: Currency.convert(10, 'USD', 'MYR'),
    THB: Currency.convert(10, 'USD', 'THB'),
  }
};
```

### Order Service

```javascript
// In order-service
const { Currency, Region } = require('@trading-platform/shared');

// Calculate order total with region-specific tax
const region = Region.getRegion(req.region);
const subtotal = 100;
const tax = subtotal * region.taxRate;
const total = subtotal + tax;

// Format for display
const formatted = Currency.format(total, region.currency);
```

## Testing

```bash
npm test
```

## License

ISC
