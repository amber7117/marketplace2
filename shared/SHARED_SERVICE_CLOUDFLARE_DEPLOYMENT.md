# Shared Service Cloudflare Deployment

The shared microservice has been successfully deployed to Cloudflare Workers as a serverless API.

## Deployment Details

- **Worker Name**: `virtual-trading-shared`
- **URL**: https://virtual-trading-shared.blackvp.workers.dev
- **Status**: ✅ Deployed and Active
- **Environment**: Production
- **API Key**: Configured with Exchange Rate API

## Available Endpoints

### Health Check
```
GET /health
```
Returns service health status and version information.

### Currency Information
```
GET /currencies
```
Returns all supported currencies with their configurations.

```
GET /currencies/supported
```
Returns list of supported currency codes.

```
GET /currencies/{code}
```
Returns specific currency information.

### Region Information
```
GET /regions
```
Returns all supported regions with their configurations.

```
GET /regions/supported
```
Returns list of supported region codes.

```
GET /regions/{code}
```
Returns specific region information.

### Internationalization (i18n)
```
GET /i18n/languages
```
Returns supported languages and default language.

```
GET /i18n/translate?key={key}&language={lang}
```
Translates a key to the specified language.

### Currency Conversion
```
GET /convert?amount={amount}&from={from}&to={to}
```
Converts currency amounts between supported currencies.

## Example Usage

### Health Check
```bash
curl https://virtual-trading-shared.blackvp.workers.dev/health
```

### Get All Currencies
```bash
curl https://virtual-trading-shared.blackvp.workers.dev/currencies
```

### Currency Conversion
```bash
curl "https://virtual-trading-shared.blackvp.workers.dev/convert?amount=100&from=USD&to=MYR"
```

### Get Region Information
```bash
curl https://virtual-trading-shared.blackvp.workers.dev/regions/MY
```

## Features

- ✅ Multi-currency support (MYR, THB, USD, VND, PHP)
- ✅ Multi-region configurations (MY, TH, US, VN, PH)
- ✅ Multi-language i18n (EN, TH, MY, CN, VI)
- ✅ Currency conversion with exchange rates
- ✅ CORS enabled for cross-origin requests
- ✅ Health monitoring endpoint
- ✅ Error handling and validation

## Integration with Other Services

Other microservices can now use the shared service API instead of including the shared library directly:

```javascript
// Example: Using shared service from another microservice
const SHARED_SERVICE_URL = 'https://virtual-trading-shared.blackvp.workers.dev';

// Get currency information
const currencies = await fetch(`${SHARED_SERVICE_URL}/currencies`).then(r => r.json());

// Convert currency
const conversion = await fetch(
  `${SHARED_SERVICE_URL}/convert?amount=100&from=USD&to=MYR`
).then(r => r.json());
```

## Environment Variables

- `NODE_ENV`: Production
- `EXCHANGE_RATE_API_KEY`: 49da14d952dd93e43e2dfd16

## Deployment Script

The service can be redeployed using:
```bash
cd shared
./deploy.sh
```

## Next Steps

1. Update other microservices to use the shared service API
2. Set up monitoring and logging
3. Configure custom domain if needed
4. Set up KV namespaces for caching
5. Configure R2 buckets for file storage

## Troubleshooting

If you encounter issues:

1. Check the health endpoint: `/health`
2. Verify environment variables are set correctly
3. Check Cloudflare Workers dashboard for logs
4. Ensure CORS headers are properly configured for frontend usage

## Support

For issues with the shared service deployment, check:
- Cloudflare Workers dashboard
- Deployment logs in `/Users/herbertlim/Library/Preferences/.wrangler/logs/`
- Service health endpoint
