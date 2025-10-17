# Multi-Currency, Multi-Region, Multi-Language Testing Guide

## Setup

```bash
# Install shared module
cd shared
npm install

# Link shared module to services (already configured in workspaces)
cd ..
npm install
```

## Test 1: Currency Conversion

```javascript
// Test in Node.js REPL or create test.js
const { Currency } = require('./shared');

// Test currency info
console.log(Currency.getCurrency('MYR'));
console.log(Currency.getCurrency('THB'));
console.log(Currency.getCurrency('VND'));

// Test formatting
console.log(Currency.formatAmount(1234.56, 'MYR')); // RM 1,234.56
console.log(Currency.formatAmount(1234.56, 'THB')); // ฿1,234.56
console.log(Currency.formatAmount(123456, 'VND'));  // ₫123,456

// Test conversion (with default rates)
console.log(Currency.convert(100, 'USD', 'MYR')); // ~472
console.log(Currency.convert(100, 'USD', 'THB')); // ~3580
console.log(Currency.convert(100, 'USD', 'VND')); // ~2450000
```

## Test 2: Region Configuration

```javascript
const { Region } = require('./shared');

// Test region info
const malaysia = Region.getRegion('MY');
console.log(malaysia);
// {
//   code: 'MY',
//   currency: 'MYR',
//   languages: ['en', 'my', 'cn'],
//   taxRate: 0.00,
//   paymentGateways: ['fpx', 'razer_gold', 'stripe', 'usdt'],
//   ...
// }

const thailand = Region.getRegion('TH');
console.log(thailand.taxRate); // 0.07 (7% VAT)

// Test tax calculation
const order = Region.calculateTotal(100, 'TH');
console.log(order);
// {
//   subtotal: 100,
//   tax: 7,
//   total: 107
// }

// Test payment gateway availability
console.log(Region.getPaymentGateways('MY')); // ['fpx', 'razer_gold', 'stripe', 'usdt']
console.log(Region.isGatewaySupported('fpx', 'MY')); // true
console.log(Region.isGatewaySupported('fpx', 'US')); // false
```

## Test 3: Multi-Language Translations

```javascript
const { translate, getTranslator } = require('./shared');

// Test direct translation
console.log(translate('common.welcome', 'en'));
console.log(translate('common.welcome', 'th'));
console.log(translate('common.welcome', 'cn'));

// Test with translator function
const thTranslator = getTranslator('th');
console.log(thTranslator('product.addToCart')); // "เพิ่มในตะกร้า"

const cnTranslator = getTranslator('cn');
console.log(cnTranslator('order.orderPlaced')); // "订单成功创建"

// Test with interpolation
console.log(translate('common.hello', 'en', { name: 'John' })); // "Hello, John"
console.log(translate('common.hello', 'th', { name: 'สมชาย' })); // "สวัสดี, สมชาย"
```

## Test 4: Express Middleware

Create `test-server.js`:

```javascript
const express = require('express');
const { detectRegion, detectLanguage, Currency } = require('./shared');

const app = express();

// Apply middleware
app.use(detectRegion);
app.use(detectLanguage);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    region: req.region,
    currency: req.currency,
    language: req.language,
    timezone: req.timezone,
    translation: req.t('common.welcome'),
    formatted: Currency.formatAmount(1234.56, req.currency),
  });
});

app.listen(4000, () => {
  console.log('Test server running on port 4000');
});
```

Test requests:

```bash
# Test with query parameters
curl "http://localhost:4000/test?region=MY&lang=en"
curl "http://localhost:4000/test?region=TH&lang=th"
curl "http://localhost:4000/test?region=VN&lang=vi"

# Test with headers
curl -H "X-Region: MY" -H "Accept-Language: en" http://localhost:4000/test
curl -H "X-Region: TH" -H "Accept-Language: th" http://localhost:4000/test
```

## Test 5: Full Integration Test

Create `integration-test.js`:

```javascript
const { Currency, Region, translate } = require('./shared');

async function testFullFlow() {
  console.log('=== Testing Multi-Currency, Multi-Region, Multi-Language ===\n');
  
  // Test 1: Product pricing in different regions
  console.log('Test 1: Product Pricing');
  const basePrice = 100; // USD
  const baseCurrency = 'USD';
  
  for (const regionCode of ['MY', 'TH', 'VN', 'PH', 'US']) {
    const region = Region.getRegion(regionCode);
    const price = await Currency.convert(basePrice, baseCurrency, region.currency);
    const formatted = Currency.formatAmount(price, region.currency);
    
    console.log(`${region.name}: ${formatted}`);
  }
  
  console.log('\n');
  
  // Test 2: Order with tax
  console.log('Test 2: Order Total with Tax');
  const orderAmount = 1000;
  
  for (const regionCode of ['MY', 'TH', 'VN', 'PH']) {
    const region = Region.getRegion(regionCode);
    const { subtotal, tax, total } = Region.calculateTotal(orderAmount, regionCode);
    
    console.log(`${region.name}:`);
    console.log(`  Subtotal: ${Currency.formatAmount(subtotal, region.currency)}`);
    console.log(`  Tax (${region.taxRate * 100}%): ${Currency.formatAmount(tax, region.currency)}`);
    console.log(`  Total: ${Currency.formatAmount(total, region.currency)}`);
  }
  
  console.log('\n');
  
  // Test 3: Payment gateways
  console.log('Test 3: Available Payment Gateways');
  for (const regionCode of ['MY', 'TH', 'US', 'VN', 'PH']) {
    const region = Region.getRegion(regionCode);
    const gateways = Region.getPaymentGateways(regionCode);
    console.log(`${region.name}: ${gateways.join(', ')}`);
  }
  
  console.log('\n');
  
  // Test 4: Translations
  console.log('Test 4: Multi-Language Translations');
  const languages = ['en', 'th', 'my', 'cn', 'vi'];
  
  for (const lang of languages) {
    const welcome = translate('common.welcome', lang);
    const orderPlaced = translate('order.orderPlaced', lang);
    console.log(`${lang.toUpperCase()}: ${welcome} | ${orderPlaced}`);
  }
  
  console.log('\n=== All Tests Completed ===');
}

testFullFlow();
```

Run test:

```bash
node integration-test.js
```

## Test 6: Currency Exchange Rate Updates

Create `test-exchange-rates.js`:

```javascript
const { Currency } = require('./shared');

// Set API key if you have one
process.env.EXCHANGE_RATE_API_KEY = 'your-api-key';

async function testExchangeRates() {
  console.log('Testing Exchange Rate Updates...\n');
  
  // Get current rates
  console.log('Current rates:', Currency.getAllRates());
  console.log('Last update:', Currency.getLastUpdate(), '\n');
  
  // Manual update
  console.log('Updating exchange rates...');
  const success = await Currency.updateExchangeRates();
  
  if (success) {
    console.log('Update successful!');
    console.log('New rates:', Currency.getAllRates());
    console.log('Last update:', Currency.getLastUpdate());
  } else {
    console.log('Update failed (using default rates)');
  }
  
  // Test conversion with updated rates
  console.log('\nConversion examples:');
  console.log(`100 USD = ${Currency.convert(100, 'USD', 'MYR').toFixed(2)} MYR`);
  console.log(`100 USD = ${Currency.convert(100, 'USD', 'THB').toFixed(2)} THB`);
  console.log(`100 USD = ${Currency.convert(100, 'USD', 'VND').toFixed(0)} VND`);
}

testExchangeRates();
```

## Test 7: API Gateway Integration

Test with actual services:

```bash
# Start all services
npm run dev

# Test Product Service with different regions
curl "http://localhost:3000/api/products?region=MY&lang=en"
curl "http://localhost:3000/api/products?region=TH&lang=th"
curl "http://localhost:3000/api/products?region=US&lang=en"

# Test Order Service with tax calculation
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Region: TH" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "items": [
      {"productId": "xxx", "quantity": 1, "price": 100}
    ]
  }'

# Test Payment Service gateways
curl "http://localhost:3000/api/payments/gateways?region=MY"
curl "http://localhost:3000/api/payments/gateways?region=TH"
```

## Expected Results

### Currency Conversion
- MYR: RM 1,234.56
- THB: ฿1,234.56
- USD: $1,234.56
- VND: ₫1,234,566 (no decimals)
- PHP: ₱1,234.56

### Tax Calculation
- Malaysia (MY): 0% tax
- Thailand (TH): 7% VAT
- Vietnam (VN): 10% VAT
- Philippines (PH): 12% VAT
- United States (US): 0% (varies by state)

### Payment Gateways
- Malaysia: FPX, Razer Gold, Stripe, USDT
- Thailand: Stripe, Razer Gold, USDT
- US: Stripe, USDT
- Vietnam: Stripe, Razer Gold, USDT
- Philippines: Stripe, Razer Gold, USDT

### Translations
All 5 languages should display correctly:
- English (en)
- Thai (th)
- Malay (my)
- Chinese (cn)
- Vietnamese (vi)

## Troubleshooting

### Issue 1: Module not found
```bash
# Re-link shared module
cd shared && npm install
cd .. && npm install
```

### Issue 2: Exchange rates not updating
```bash
# Check API key
echo $EXCHANGE_RATE_API_KEY

# Test manually
node -e "const {Currency} = require('./shared'); Currency.updateExchangeRates().then(console.log);"
```

### Issue 3: Translations missing
```bash
# Check locale files exist
ls -la shared/i18n/locales/
```

## Performance Benchmarks

Run performance test:

```javascript
// perf-test.js
const { Currency, translate } = require('./shared');

console.time('1000 currency conversions');
for (let i = 0; i < 1000; i++) {
  Currency.convert(100, 'USD', 'MYR');
}
console.timeEnd('1000 currency conversions');

console.time('1000 translations');
for (let i = 0; i < 1000; i++) {
  translate('common.welcome', 'th');
}
console.timeEnd('1000 translations');

console.time('1000 currency formats');
for (let i = 0; i < 1000; i++) {
  Currency.formatAmount(1234.56, 'MYR');
}
console.timeEnd('1000 currency formats');
```

Expected performance:
- Currency conversions: <10ms for 1000 operations
- Translations: <50ms for 1000 operations
- Formatting: <100ms for 1000 operations

## Complete Testing Checklist

- [ ] Currency info retrieval for all 5 currencies
- [ ] Currency formatting for all 5 currencies
- [ ] Currency conversion between all pairs
- [ ] Region info for all 5 regions
- [ ] Tax calculation for all regions
- [ ] Payment gateway availability check
- [ ] Translations in all 5 languages
- [ ] Region detection from headers
- [ ] Language detection from Accept-Language
- [ ] Express middleware integration
- [ ] API Gateway header forwarding
- [ ] Exchange rate updates (with API key)
- [ ] Full integration flow test

All tests passing? You're ready to deploy! 🚀
