# Payment Service

Payment gateway integration service for Virtual Trading Platform. Supports multiple payment methods including credit cards (Stripe), Razer Gold, FPX online banking, and USDT cryptocurrency.

## Features

- **Multiple Payment Gateways**
  - Stripe (Credit/Debit Cards)
  - Razer Gold (Gaming Payment)
  - FPX (Malaysian Online Banking)
  - USDT (Cryptocurrency)

- **Payment Types**
  - Topup (充值) - Add funds to wallet
  - Order Payment - Pay for product orders
  - Withdrawal - Cash out funds

- **Payment Lifecycle**
  - Status tracking: pending → processing → completed/failed/cancelled/refunded
  - Timeline tracking for audit trail
  - Automatic expiry for pending payments (24 hours)
  - Webhook handling for asynchronous payment confirmation

- **Payment Methods**
  - Save payment methods for future use
  - Support for credit cards, bank accounts, crypto wallets
  - Default payment method selection

## Tech Stack

- Node.js 18+ with Express
- MongoDB with Mongoose
- Stripe SDK v13.10.0
- JWT authentication
- Rate limiting & security headers

## Environment Variables

Create `.env` file based on `.env.example`:

```env
# Server
PORT=3005
NODE_ENV=development
JWT_SECRET=your-jwt-secret

# Database
MONGODB_URI=mongodb://localhost:27017/payment-service

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Razer Gold
RAZER_MERCHANT_ID=your-merchant-id
RAZER_SECRET_KEY=your-secret-key
RAZER_API_URL=https://api.razer.com

# FPX
FPX_SELLER_ID=your-seller-id
FPX_SELLER_EXCHANGE_ID=your-exchange-id
FPX_SELLER_BANK_CODE=your-bank-code
FPX_API_URL=https://uat.mepsfpx.com.my

# USDT (TRC20)
USDT_WALLET_ADDRESS=your-tron-wallet-address
USDT_NETWORK=TRC20
USDT_API_URL=https://api.trongrid.io
TRONGRID_API_KEY=your-trongrid-api-key

# Service URLs
WALLET_SERVICE_URL=http://localhost:3004
```

## Installation

```bash
# Install dependencies
npm install

# Start service
npm start

# Development mode with auto-reload
npm run dev
```

## API Endpoints

### Create Payment
Create a new payment for topup, order, or withdrawal.

**Endpoint:** `POST /api/payments`  
**Authentication:** Required

**Request Body:**
```json
{
  "paymentType": "topup",
  "amount": 100.00,
  "currency": "MYR",
  "gateway": "stripe",
  "metadata": {
    "orderId": "ORD-123",
    "buyerName": "John Doe",
    "buyerEmail": "john@example.com",
    "buyerBankId": "MAYBANK"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-abc123",
    "amount": 100.00,
    "currency": "MYR",
    "gateway": "stripe",
    "status": "pending",
    "gatewayData": {
      "clientSecret": "pi_..._secret_...",
      "paymentIntentId": "pi_..."
    }
  }
}
```

### Get User Payments
Retrieve list of user's payments with filtering.

**Endpoint:** `GET /api/payments`  
**Authentication:** Required

**Query Parameters:**
- `paymentType` - Filter by type (topup/order/withdrawal)
- `status` - Filter by status (pending/completed/failed)
- `gateway` - Filter by gateway (stripe/razer/fpx/usdt)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "paymentId": "PAY-abc123",
      "paymentType": "topup",
      "amount": 100.00,
      "currency": "MYR",
      "gateway": "stripe",
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 95,
    "itemsPerPage": 20
  }
}
```

### Get Payment Details
Retrieve detailed information about a specific payment.

**Endpoint:** `GET /api/payments/:paymentId`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-abc123",
    "userId": "user123",
    "paymentType": "topup",
    "amount": 100.00,
    "currency": "MYR",
    "gateway": "stripe",
    "status": "completed",
    "fee": {
      "amount": 3.20,
      "currency": "MYR"
    },
    "netAmount": 96.80,
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2024-01-15T10:30:00Z",
        "note": "Payment created"
      },
      {
        "status": "processing",
        "timestamp": "2024-01-15T10:30:15Z",
        "note": "Payment initiated with gateway"
      },
      {
        "status": "completed",
        "timestamp": "2024-01-15T10:31:00Z",
        "note": "Payment successful"
      }
    ],
    "gatewayResponse": {
      "paymentIntentId": "pi_...",
      "chargeId": "ch_...",
      "receiptUrl": "https://..."
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:31:00Z"
  }
}
```

### Cancel Payment
Cancel a pending or processing payment.

**Endpoint:** `POST /api/payments/:paymentId/cancel`  
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Payment cancelled",
  "data": {
    "paymentId": "PAY-abc123",
    "status": "cancelled"
  }
}
```

### Refund Payment (Admin)
Process a refund for a completed payment.

**Endpoint:** `POST /api/payments/:paymentId/refund`  
**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "amount": 50.00,
  "reason": "Customer request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "paymentId": "PAY-abc123",
    "status": "refunded",
    "refund": {
      "amount": 50.00,
      "currency": "MYR",
      "reason": "Customer request",
      "processedAt": "2024-01-15T14:30:00Z"
    }
  }
}
```

### Verify USDT Payment
Verify USDT cryptocurrency payment using transaction hash.

**Endpoint:** `POST /api/payments/:paymentId/verify-usdt`  
**Authentication:** Required

**Request Body:**
```json
{
  "txHash": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and completed",
  "data": {
    "paymentId": "PAY-abc123",
    "status": "completed"
  }
}
```

### Payment Webhook
Receive payment status updates from payment gateways.

**Endpoint:** `POST /api/payments/webhook/:gateway`  
**Authentication:** Not required (signature verification)

**Supported Gateways:**
- `/api/payments/webhook/stripe`
- `/api/payments/webhook/razer`
- `/api/payments/webhook/fpx`

### Get Payment Statistics (Admin)
Retrieve payment statistics and analytics.

**Endpoint:** `GET /api/payments/stats`  
**Authentication:** Required (Admin)

**Query Parameters:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalTransactions": 1250,
    "totalRevenue": 125000.00,
    "totalFees": 3625.00,
    "byStatus": [
      {
        "status": "completed",
        "count": 1100,
        "totalAmount": 120000.00
      },
      {
        "status": "failed",
        "count": 100,
        "totalAmount": 3000.00
      }
    ],
    "byGateway": [
      {
        "gateway": "stripe",
        "count": 800,
        "totalAmount": 90000.00
      },
      {
        "gateway": "fpx",
        "count": 300,
        "totalAmount": 25000.00
      }
    ],
    "byPaymentType": [
      {
        "paymentType": "topup",
        "count": 600,
        "totalAmount": 70000.00
      },
      {
        "paymentType": "order",
        "count": 500,
        "totalAmount": 50000.00
      }
    ]
  }
}
```

## Payment Gateway Integration

### Stripe Integration

**Setup:**
1. Create Stripe account at https://stripe.com
2. Get API keys from Dashboard
3. Set up webhook endpoint
4. Configure webhook secret

**Test Cards:**
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

**Client Integration:**
```javascript
// Frontend code
const stripe = Stripe('pk_test_...');

const response = await fetch('/api/payments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentType: 'topup',
    amount: 100,
    currency: 'MYR',
    gateway: 'stripe'
  })
});

const { data } = await response.json();

const { error } = await stripe.confirmCardPayment(data.gatewayData.clientSecret);

if (error) {
  console.error('Payment failed:', error);
} else {
  console.log('Payment successful!');
}
```

### Razer Gold Integration

**Setup:**
1. Register merchant account
2. Get merchant ID and secret key
3. Configure callback URL

**Payment Flow:**
1. Create payment → Get payment URL
2. Redirect user to Razer payment page
3. User completes payment
4. Razer sends callback to webhook
5. System processes completion

### FPX Integration

**Setup:**
1. Register with Malaysian banks
2. Get seller credentials
3. Configure return/callback URLs

**Supported Banks:**
- Maybank
- CIMB Bank
- Public Bank
- Hong Leong Bank
- RHB Bank
- AmBank
- Bank Islam
- And more...

**Payment Flow:**
1. Create payment with bank selection
2. Redirect user to FPX gateway
3. User logs into online banking
4. Completes payment
5. FPX sends callback
6. System processes completion

### USDT Integration

**Setup:**
1. Create USDT wallet (TRC20/ERC20)
2. Get TronGrid API key
3. Configure wallet address

**Payment Flow:**
1. Generate payment address & QR code
2. User sends USDT to address
3. User submits transaction hash
4. System verifies on blockchain
5. Credits wallet on confirmation

**Manual Verification:**
```bash
# Check transaction on TronScan
https://tronscan.org/#/transaction/[TX_HASH]
```

## Payment Lifecycle

### Status Flow
```
pending → processing → completed
              ↓
            failed
            cancelled
            refunded
```

### Timeline Tracking
Every payment maintains a timeline array:
```javascript
[
  {
    status: 'pending',
    timestamp: '2024-01-15T10:30:00Z',
    note: 'Payment created'
  },
  {
    status: 'processing',
    timestamp: '2024-01-15T10:30:15Z',
    note: 'Payment initiated with gateway'
  },
  {
    status: 'completed',
    timestamp: '2024-01-15T10:31:00Z',
    note: 'Payment successful'
  }
]
```

### Automatic Expiry
Pending payments expire after 24 hours and are automatically deleted from the database.

## Wallet Integration

Payment Service integrates with Wallet Service for topup (充值):

1. User creates topup payment
2. Payment gateway processes payment
3. On successful payment:
   - Payment Service calls Wallet Service `/api/wallets/deposit`
   - Wallet balance is credited
   - Transaction record is created

4. On refund:
   - Payment Service calls Wallet Service `/api/wallets/deduct`
   - Refunded amount is deducted from wallet

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `404` - Not Found (payment not found)
- `500` - Internal Server Error

## Security

- **Rate Limiting:** 1000 requests per 15 minutes
- **JWT Authentication:** Required for all protected endpoints
- **Webhook Signature Verification:** Validates gateway callbacks
- **Input Validation:** express-validator for request validation
- **Helmet.js:** Security headers
- **CORS:** Cross-origin resource sharing

## Monitoring

### Health Check
```bash
curl http://localhost:3005/health
```

Response:
```json
{
  "success": true,
  "service": "payment-service",
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "database": "connected",
  "gateways": {
    "stripe": true,
    "razer": true,
    "fpx": true,
    "usdt": true
  }
}
```

### Logs
Service logs include:
- Request/response logs with timing
- Payment creation and status updates
- Gateway API calls and responses
- Webhook processing
- Error details

## Database Schema

### Payment Model
```javascript
{
  paymentId: 'PAY-abc123',
  userId: 'user123',
  paymentType: 'topup',
  amount: 100.00,
  currency: 'MYR',
  gateway: 'stripe',
  status: 'completed',
  metadata: {},
  gatewayResponse: {},
  fee: { amount: 3.20, currency: 'MYR' },
  refund: {},
  timeline: [],
  expiresAt: Date,
  completedAt: Date
}
```

### PaymentMethod Model
```javascript
{
  userId: 'user123',
  gateway: 'stripe',
  type: 'card',
  isDefault: false,
  cardDetails: {
    brand: 'visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 2025
  },
  gatewayData: {},
  usage: {
    totalTransactions: 10,
    totalAmount: 1000.00,
    lastUsedAt: Date
  }
}
```

## Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

## Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure production database
- [ ] Set up SSL/TLS certificates
- [ ] Configure production payment gateway accounts
- [ ] Set up webhook URLs in gateway dashboards
- [ ] Enable production API keys
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up database backups
- [ ] Load test payment flows

### Docker Deployment
```bash
# Build image
docker build -t payment-service .

# Run container
docker run -p 3005:3005 --env-file .env payment-service
```

## Support

For issues or questions:
- Check TESTING.md for test scenarios
- Review gateway documentation
- Check service logs
- Contact development team

## License

ISC
