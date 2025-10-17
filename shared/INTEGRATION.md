# Integration Guide - Shared Module

Complete guide to integrate multi-currency, multi-region, and multi-language support into your microservices.

## Quick Start

### 1. Install Dependencies

```bash
cd shared
npm install
```

### 2. Link Shared Module

```bash
# In root directory
npm install ./shared
```

Or add to service's `package.json`:

```json
{
  "dependencies": {
    "@trading-platform/shared": "file:../../shared"
  }
}
```

## Integration Steps

### Step 1: Update API Gateway

Add middleware to API Gateway for global region/language detection:

```javascript
// api-gateway/server.js
const { detectRegion, detectLanguage } = require('@trading-platform/shared');

// Apply middleware before routes
app.use(detectRegion);
app.use(detectLanguage);

// Forward headers to services
app.use((req, res, next) => {
  req.headers['x-region'] = req.region;
  req.headers['x-language'] = req.language;
  req.headers['x-currency'] = req.currency;
  next();
});
```

### Step 2: Update Product Service

Add multi-currency pricing:

```javascript
// services/product-service/server.js
const { Currency, detectRegion, detectLanguage } = require('@trading-platform/shared');

app.use(detectRegion);
app.use(detectLanguage);

// Start exchange rate updates
Currency.startAutoUpdate();

// In controller
exports.getProducts = async (req, res) => {
  const products = await Product.find();
  const currency = req.currency;
  
  // Convert prices to user's currency
  const convertedProducts = await Promise.all(
    products.map(async (product) => {
      const convertedPrice = await Currency.convert(
        product.price,
        product.baseCurrency || 'USD',
        currency
      );
      
      return {
        ...product.toObject(),
        price: convertedPrice,
        formattedPrice: Currency.formatAmount(convertedPrice, currency),
        currency: currency,
      };
    })
  );
  
  res.json({
    success: true,
    data: convertedProducts,
    message: req.t('common.success'),
  });
};
```

### Step 3: Update Order Service

Add region-specific tax calculation:

```javascript
// services/order-service/src/controllers/orderController.js
const { Region, Currency } = require('@trading-platform/shared');

exports.createOrder = async (req, res) => {
  const { items } = req.body;
  const regionCode = req.region;
  const currency = req.currency;
  
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // Calculate tax based on region
  const { tax, total } = Region.calculateTotal(subtotal, regionCode);
  
  // Create order
  const order = await Order.create({
    userId: req.userId,
    items,
    subtotal,
    tax,
    total,
    currency,
    region: regionCode,
  });
  
  res.json({
    success: true,
    data: {
      ...order.toObject(),
      formattedSubtotal: Currency.formatAmount(subtotal, currency),
      formattedTax: Currency.formatAmount(tax, currency),
      formattedTotal: Currency.formatAmount(total, currency),
    },
    message: req.t('order.orderPlaced'),
  });
};
```

### Step 4: Update Payment Service

Add region-specific payment gateways:

```javascript
// services/payment-service/src/controllers/paymentController.js
const { Region } = require('@trading-platform/shared');

exports.getAvailableGateways = async (req, res) => {
  const regionCode = req.region;
  const gateways = Region.getPaymentGateways(regionCode);
  
  res.json({
    success: true,
    data: gateways,
    region: regionCode,
  });
};

exports.createPayment = async (req, res) => {
  const { gateway, amount } = req.body;
  const regionCode = req.region;
  
  // Validate gateway for region
  if (!Region.isGatewaySupported(gateway, regionCode)) {
    return res.status(400).json({
      success: false,
      error: req.t('payment.gatewayNotSupported'),
    });
  }
  
  // Process payment...
};
```

### Step 5: Update Notification Service

Add multi-language notifications:

```javascript
// services/notification-service/src/controllers/notificationController.js
const { translate } = require('@trading-platform/shared');

exports.sendNotification = async (req, res) => {
  const { userId, type, data } = req.body;
  
  // Get user's preferred language
  const userPreference = await NotificationPreference.findOne({ userId });
  const language = userPreference?.language || 'en';
  
  // Get translated content
  const subject = translate(`notification.${type}.subject`, language, data);
  const content = translate(`notification.${type}.content`, language, data);
  
  // Send notification
  await sendEmail({
    to: userPreference.email,
    subject,
    content,
  });
  
  res.json({
    success: true,
    message: req.t('notification.sent'),
  });
};
```

### Step 6: Update Database Models

Add currency and region fields:

```javascript
// Product Model
const productSchema = new mongoose.Schema({
  name: String,
  basePrice: Number,
  baseCurrency: { type: String, default: 'USD' },
  // Other fields...
});

// Order Model
const orderSchema = new mongoose.Schema({
  userId: String,
  items: Array,
  subtotal: Number,
  tax: Number,
  total: Number,
  currency: String,
  region: String,
  // Other fields...
});

// User Model
const userSchema = new mongoose.Schema({
  email: String,
  preferredLanguage: { type: String, default: 'en' },
  preferredCurrency: String,
  region: String,
  // Other fields...
});
```

## Testing Integration

### Test 1: Multi-Currency

```bash
# Get products in MYR
curl "http://localhost:3000/api/products?region=MY"

# Get products in THB
curl "http://localhost:3000/api/products?region=TH"

# Get products in USD
curl "http://localhost:3000/api/products?region=US"
```

### Test 2: Multi-Language

```bash
# Get in English
curl "http://localhost:3000/api/products?lang=en"

# Get in Thai
curl "http://localhost:3000/api/products?lang=th"

# Get in Chinese
curl "http://localhost:3000/api/products?lang=cn"
```

### Test 3: Region-Specific Features

```bash
# Check available payment gateways for Malaysia
curl "http://localhost:3000/api/payments/gateways?region=MY"

# Check available payment gateways for Thailand
curl "http://localhost:3000/api/payments/gateways?region=TH"
```

### Test 4: Tax Calculation

```bash
# Create order in Malaysia (0% tax)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Region: MY" \
  -d '{"items": [{"price": 100, "quantity": 1}]}'

# Create order in Thailand (7% VAT)
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "X-Region: TH" \
  -d '{"items": [{"price": 100, "quantity": 1}]}'
```

## Environment Setup

### Development

```bash
# In each service that uses shared module
cp shared/.env.example shared/.env

# Edit shared/.env with your API keys
EXCHANGE_RATE_API_KEY=your-api-key-here
```

### Production

Set environment variables:
- `EXCHANGE_RATE_API_KEY`: ExchangeRate-API key
- `DEFAULT_CURRENCY`: Default currency (USD)
- `DEFAULT_REGION`: Default region (GLOBAL)
- `DEFAULT_LANGUAGE`: Default language (en)

## API Gateway Updates

Update API Gateway to forward region/language info:

```javascript
// api-gateway/src/routes/serviceRoutes.js
const proxy = createProxyMiddleware({
  target: serviceUrl,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    // Forward region and language headers
    proxyReq.setHeader('X-Region', req.region);
    proxyReq.setHeader('X-Language', req.language);
    proxyReq.setHeader('X-Currency', req.currency);
  },
});
```

## Database Migration

### Add Fields to Existing Documents

```javascript
// Migration script
const mongoose = require('mongoose');

async function migrate() {
  // Update products with base currency
  await Product.updateMany(
    { baseCurrency: { $exists: false } },
    { $set: { baseCurrency: 'USD' } }
  );
  
  // Update users with default language
  await User.updateMany(
    { preferredLanguage: { $exists: false } },
    { $set: { preferredLanguage: 'en' } }
  );
  
  console.log('Migration completed');
}
```

## Frontend Integration

### JavaScript/React Example

```javascript
// Set user's region and language
localStorage.setItem('region', 'MY');
localStorage.setItem('language', 'en');

// Add to API requests
const config = {
  headers: {
    'X-Region': localStorage.getItem('region') || 'GLOBAL',
    'X-Language': localStorage.getItem('language') || 'en',
  },
};

// Fetch products
const response = await axios.get('/api/products', config);

// Display formatted price
console.log(response.data.data[0].formattedPrice); // "RM 99.90"
```

## Monitoring

### Exchange Rate Updates

```javascript
// In shared module startup
const { Currency } = require('@trading-platform/shared');

Currency.startAutoUpdate();

// Check last update
setInterval(() => {
  const lastUpdate = Currency.getLastUpdate();
  console.log(`Exchange rates last updated: ${lastUpdate}`);
}, 60000);
```

## Troubleshooting

### Issue 1: Exchange rates not updating
- Check `EXCHANGE_RATE_API_KEY` is set
- Verify API key is valid
- Check network connectivity

### Issue 2: Wrong currency displayed
- Verify region detection middleware is applied
- Check `X-Region` header is forwarded
- Ensure currency conversion is awaited

### Issue 3: Translations not working
- Check translation files exist in `shared/i18n/locales/`
- Verify language code is correct
- Ensure i18next is initialized

## Performance Tips

1. **Cache exchange rates**: Rates update hourly, safe to cache
2. **Pre-calculate prices**: Store prices in multiple currencies
3. **CDN for translations**: Serve translation files from CDN
4. **Database indexing**: Index `region` and `currency` fields

## Next Steps

1. Update root `package.json` to link shared module
2. Update all services to use shared module
3. Run database migration scripts
4. Update frontend to pass region/language
5. Test all services with different regions/languages
6. Deploy with environment variables set

## Complete!

Your platform now supports:
- ✅ Multi-currency (MYR, THB, USD, VND, PHP)
- ✅ Multi-region (MY, TH, US, VN, PH)
- ✅ Multi-language (EN, TH, MY, CN, VI)
- ✅ Automatic exchange rate updates
- ✅ Region-specific tax calculation
- ✅ Region-specific payment gateways
