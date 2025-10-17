# Payment Service Testing Guide

Complete testing guide for Payment Service with real-world scenarios and curl examples.

## Table of Contents
1. [Setup](#setup)
2. [Authentication](#authentication)
3. [Payment Creation Tests](#payment-creation-tests)
4. [Payment Lifecycle Tests](#payment-lifecycle-tests)
5. [Gateway-Specific Tests](#gateway-specific-tests)
6. [Webhook Tests](#webhook-tests)
7. [Error Handling Tests](#error-handling-tests)
8. [Integration Tests](#integration-tests)

## Setup

### Prerequisites
```bash
# Start MongoDB
mongod

# Start Payment Service
cd services/payment-service
npm install
npm start

# Start Wallet Service (for integration tests)
cd services/wallet-service
npm start
```

### Environment Variables
Ensure these are set in `.env`:
```env
PORT=3005
JWT_SECRET=test-secret
MONGODB_URI=mongodb://localhost:27017/payment-service-test
STRIPE_SECRET_KEY=sk_test_...
WALLET_SERVICE_URL=http://localhost:3004
```

## Authentication

### Get JWT Token
First, register and login through Auth Service:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'

# Save the token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Payment Creation Tests

### Test 1: Create Stripe Topup Payment

**Scenario:** User wants to add MYR 100 to wallet using credit card

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 100.00,
    "currency": "MYR",
    "gateway": "stripe",
    "metadata": {
      "description": "Wallet topup"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-...",
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

**What to verify:**
- Payment ID is generated in format `PAY-{timestamp}-{random}`
- Status is `pending`
- Gateway returns `clientSecret` for frontend
- Processing fee is calculated (2.9% + 0.30)

### Test 2: Create Razer Gold Payment

**Scenario:** User wants to topup using Razer Gold

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 50.00,
    "currency": "MYR",
    "gateway": "razer",
    "metadata": {
      "description": "Razer Gold topup"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-...",
    "amount": 50.00,
    "currency": "MYR",
    "gateway": "razer",
    "status": "pending",
    "gatewayData": {
      "transactionId": "RZR-...",
      "paymentUrl": "https://..."
    }
  }
}
```

**What to verify:**
- Payment URL is returned for redirect
- Transaction ID from Razer is stored
- Processing fee is 3.5% of amount

### Test 3: Create FPX Payment

**Scenario:** User pays with Maybank online banking

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 200.00,
    "currency": "MYR",
    "gateway": "fpx",
    "metadata": {
      "buyerName": "Ahmad bin Abdullah",
      "buyerEmail": "ahmad@example.com",
      "buyerBankId": "MB2U0227"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-...",
    "amount": 200.00,
    "currency": "MYR",
    "gateway": "fpx",
    "status": "pending",
    "gatewayData": {
      "paymentUrl": "https://uat.mepsfpx.com.my/...",
      "paymentData": {
        "fpx_msgType": "AE",
        "fpx_sellerOrderNo": "PAY-...",
        "fpx_buyerBankId": "MB2U0227"
      }
    }
  }
}
```

**What to verify:**
- FPX payment form data is generated
- Bank ID is validated (Maybank: MB2U0227)
- Flat fee of MYR 1.00 is applied

### Test 4: Create USDT Payment

**Scenario:** User wants to topup using USDT cryptocurrency

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 100.00,
    "currency": "USDT",
    "gateway": "usdt",
    "metadata": {
      "description": "USDT topup"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-...",
    "amount": 100.00,
    "currency": "USDT",
    "gateway": "usdt",
    "status": "pending",
    "gatewayData": {
      "address": "TXYZabcdef123456789...",
      "network": "TRC20",
      "qrCodeUrl": "https://api.qrserver.com/..."
    }
  }
}
```

**What to verify:**
- Wallet address is returned
- QR code URL is generated
- Network type (TRC20/ERC20) is specified

### Test 5: Create Order Payment

**Scenario:** User pays for product order

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "order",
    "amount": 79.90,
    "currency": "MYR",
    "gateway": "stripe",
    "metadata": {
      "orderId": "ORD-1234567890",
      "description": "Order payment"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-...",
    "amount": 79.90,
    "currency": "MYR",
    "gateway": "stripe",
    "status": "pending",
    "gatewayData": {
      "clientSecret": "pi_...",
      "paymentIntentId": "pi_..."
    }
  }
}
```

## Payment Lifecycle Tests

### Test 6: Get User Payments List

**Scenario:** Retrieve all user payments with pagination

```bash
# Get all payments
curl http://localhost:3005/api/payments \
  -H "Authorization: Bearer $TOKEN"

# Filter by type
curl "http://localhost:3005/api/payments?paymentType=topup" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:3005/api/payments?status=completed" \
  -H "Authorization: Bearer $TOKEN"

# Filter by gateway with pagination
curl "http://localhost:3005/api/payments?gateway=stripe&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "paymentId": "PAY-...",
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
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### Test 7: Get Payment Details

**Scenario:** View detailed payment information with timeline

```bash
PAYMENT_ID="PAY-1234567890"

curl http://localhost:3005/api/payments/$PAYMENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paymentId": "PAY-1234567890",
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
    "createdAt": "2024-01-15T10:30:00Z",
    "completedAt": "2024-01-15T10:31:00Z"
  }
}
```

**What to verify:**
- Timeline shows all status changes
- Net amount = amount - fee
- Completed timestamp is set

### Test 8: Cancel Pending Payment

**Scenario:** User cancels payment before completion

```bash
PAYMENT_ID="PAY-pending123"

curl -X POST http://localhost:3005/api/payments/$PAYMENT_ID/cancel \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment cancelled",
  "data": {
    "paymentId": "PAY-pending123",
    "status": "cancelled"
  }
}
```

**What to verify:**
- Only pending/processing payments can be cancelled
- Timeline is updated with cancellation note
- Completed payments return error

### Test 9: Refund Completed Payment (Admin)

**Scenario:** Admin processes refund for customer

```bash
PAYMENT_ID="PAY-completed123"

curl -X POST http://localhost:3005/api/payments/$PAYMENT_ID/refund \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "amount": 50.00,
    "reason": "Customer request - duplicate payment"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "paymentId": "PAY-completed123",
    "status": "refunded",
    "refund": {
      "amount": 50.00,
      "currency": "MYR",
      "reason": "Customer request - duplicate payment",
      "processedAt": "2024-01-15T14:30:00Z"
    }
  }
}
```

**What to verify:**
- Refund is processed with Stripe
- Wallet Service is called to deduct amount
- Payment status becomes `refunded`
- Timeline shows refund details

## Gateway-Specific Tests

### Test 10: Stripe Payment Intent Confirmation

**Scenario:** Frontend confirms payment with Stripe Elements

```javascript
// Frontend code
const stripe = Stripe('pk_test_...');

// Get clientSecret from payment creation
const { data } = await fetch('/api/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    paymentType: 'topup',
    amount: 100,
    currency: 'MYR',
    gateway: 'stripe'
  })
}).then(r => r.json());

// Confirm payment
const { error } = await stripe.confirmCardPayment(data.gatewayData.clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Test User',
      email: 'test@example.com'
    }
  }
});

if (error) {
  console.error('Payment failed:', error);
} else {
  console.log('Payment successful!');
  // Webhook will be called automatically
}
```

### Test 11: USDT Transaction Verification

**Scenario:** User submits USDT transaction hash for verification

```bash
PAYMENT_ID="PAY-usdt123"
TX_HASH="0xabcdef1234567890..."

curl -X POST http://localhost:3005/api/payments/$PAYMENT_ID/verify-usdt \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "txHash": "'"$TX_HASH"'"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment verified and completed",
  "data": {
    "paymentId": "PAY-usdt123",
    "status": "completed"
  }
}
```

**What to verify:**
- Transaction is verified on blockchain (TronGrid API)
- Amount matches payment amount
- Destination address matches merchant wallet
- Payment is marked completed
- Wallet is credited

### Test 12: FPX Bank List

**Scenario:** Get list of supported FPX banks

```javascript
// In controller or gateway code
const fpxGateway = require('./gateways/fpxGateway');
const banks = fpxGateway.getBankList();

console.log(banks);
// Output:
// [
//   { code: 'MB2U0227', name: 'Maybank' },
//   { code: 'PBB0233', name: 'Public Bank' },
//   { code: 'RHB0218', name: 'RHB Bank' },
//   ...
// ]
```

## Webhook Tests

### Test 13: Stripe Webhook - Payment Success

**Scenario:** Stripe sends webhook on successful payment

```bash
# Simulate Stripe webhook (use Stripe CLI for real testing)
stripe listen --forward-to localhost:3005/api/payments/webhook/stripe

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

**Webhook Payload:**
```json
{
  "id": "evt_...",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_...",
      "amount": 10000,
      "currency": "myr",
      "status": "succeeded",
      "charges": {
        "data": [{
          "id": "ch_...",
          "receipt_url": "https://..."
        }]
      }
    }
  }
}
```

**What happens:**
1. Webhook signature is verified
2. Payment is found by paymentIntentId
3. Payment status is updated to `completed`
4. Wallet Service is called to credit balance
5. Timeline is updated

### Test 14: Razer Gold Callback

**Scenario:** Razer sends callback on payment completion

```bash
# Simulate Razer callback
curl -X POST http://localhost:3005/api/payments/webhook/razer \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "TEST_MERCHANT",
    "transaction_id": "RZR-123456",
    "order_id": "PAY-1234567890",
    "amount": "100.00",
    "currency": "MYR",
    "status": "success",
    "signature": "abc123def456...",
    "timestamp": "1705315800000"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

**What to verify:**
- Signature is validated
- Payment is found by transaction_id
- Status is updated based on callback status
- Wallet is credited for topup payments

### Test 15: FPX Callback - Payment Failed

**Scenario:** FPX sends callback for failed payment

```bash
curl -X POST http://localhost:3005/api/payments/webhook/fpx \
  -H "Content-Type: application/json" \
  -d '{
    "fpx_debitAuthCode": "99",
    "fpx_debitAuthNo": "1234567890",
    "fpx_sellerOrderNo": "PAY-1234567890",
    "fpx_txnAmount": "200.00",
    "fpx_txnCurrency": "MYR",
    "fpx_checkSum": "..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook processed"
}
```

**What to verify:**
- Checksum is validated
- Payment status becomes `failed` (authCode != "00")
- Timeline shows failure reason
- Wallet is NOT credited

## Error Handling Tests

### Test 16: Invalid Payment Amount

**Scenario:** User tries to create payment with invalid amount

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": -50.00,
    "currency": "MYR",
    "gateway": "stripe"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Amount must be greater than 0"
}
```

### Test 17: Unsupported Gateway-Currency Combination

**Scenario:** User tries FPX with USD (not supported)

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 100.00,
    "currency": "USD",
    "gateway": "fpx"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Gateway fpx does not support currency USD"
}
```

### Test 18: Cancel Completed Payment

**Scenario:** User tries to cancel already completed payment

```bash
PAYMENT_ID="PAY-completed123"

curl -X POST http://localhost:3005/api/payments/$PAYMENT_ID/cancel \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Cannot cancel payment in current status"
}
```

### Test 19: Payment Not Found

**Scenario:** User requests non-existent payment

```bash
curl http://localhost:3005/api/payments/PAY-nonexistent \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Payment not found"
}
```

### Test 20: Missing Authentication

**Scenario:** Request without JWT token

```bash
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "paymentType": "topup",
    "amount": 100.00,
    "currency": "MYR",
    "gateway": "stripe"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "No token provided"
}
```

## Integration Tests

### Test 21: Full Topup Flow

**Scenario:** Complete end-to-end topup with wallet credit

```bash
# 1. Create payment
PAYMENT_RESPONSE=$(curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 100.00,
    "currency": "MYR",
    "gateway": "stripe"
  }')

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | jq -r '.data.paymentId')
CLIENT_SECRET=$(echo $PAYMENT_RESPONSE | jq -r '.data.gatewayData.clientSecret')

# 2. (Frontend confirms payment with Stripe)
# stripe.confirmCardPayment(CLIENT_SECRET, ...)

# 3. Webhook is received (simulate)
# Payment is marked completed

# 4. Check wallet balance
curl http://localhost:3004/api/wallets/balance \
  -H "Authorization: Bearer $TOKEN"

# Expected: Balance increased by 100.00 MYR
```

### Test 22: Payment with Saved Payment Method

**Scenario:** User pays with previously saved card

```bash
# 1. Get saved payment methods (feature to be implemented)
curl http://localhost:3005/api/payment-methods \
  -H "Authorization: Bearer $TOKEN"

# 2. Create payment with saved method
curl -X POST http://localhost:3005/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 50.00,
    "currency": "MYR",
    "gateway": "stripe",
    "paymentMethodId": "pm_..."
  }'
```

### Test 23: Payment Statistics

**Scenario:** Admin views payment analytics

```bash
# Get all-time stats
curl http://localhost:3005/api/payments/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Get stats for date range
START_DATE="2024-01-01T00:00:00Z"
END_DATE="2024-01-31T23:59:59Z"

curl "http://localhost:3005/api/payments/stats?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
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
      },
      {
        "status": "refunded",
        "count": 50,
        "totalAmount": 2000.00
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
      },
      {
        "gateway": "razer",
        "count": 100,
        "totalAmount": 8000.00
      },
      {
        "gateway": "usdt",
        "count": 50,
        "totalAmount": 2000.00
      }
    ],
    "byPaymentType": [
      {
        "paymentType": "topup",
        "count": 700,
        "totalAmount": 80000.00
      },
      {
        "paymentType": "order",
        "count": 500,
        "totalAmount": 40000.00
      },
      {
        "paymentType": "withdrawal",
        "count": 50,
        "totalAmount": 5000.00
      }
    ]
  }
}
```

## Performance Tests

### Test 24: Concurrent Payment Creation

**Scenario:** Stress test with multiple simultaneous payments

```bash
# Create 10 concurrent payments
for i in {1..10}; do
  curl -X POST http://localhost:3005/api/payments \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "paymentType": "topup",
      "amount": 10.00,
      "currency": "MYR",
      "gateway": "stripe"
    }' &
done
wait

echo "All 10 payments created"
```

**What to verify:**
- All requests complete successfully
- No duplicate payment IDs
- Response time < 2 seconds per request
- Database connections are properly managed

### Test 25: Rate Limiting

**Scenario:** Exceed rate limit

```bash
# Send 1001 requests (limit is 1000 per 15 min)
for i in {1..1001}; do
  curl http://localhost:3005/api/payments \
    -H "Authorization: Bearer $TOKEN"
done
```

**Expected:**
- First 1000 requests: Success
- Request 1001: Rate limit error

```json
{
  "success": false,
  "error": "Too many requests from this IP"
}
```

## Health Check Tests

### Test 26: Service Health

**Scenario:** Check service and gateway status

```bash
curl http://localhost:3005/health
```

**Expected Response:**
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

## Automated Testing Script

Create `test-all.sh`:

```bash
#!/bin/bash

echo "=== Payment Service Test Suite ==="

# Set variables
API_URL="http://localhost:3005"
TOKEN="your-jwt-token"

# Test 1: Health check
echo "Test 1: Health check"
curl -s $API_URL/health | jq

# Test 2: Create Stripe payment
echo "\nTest 2: Create Stripe payment"
PAYMENT=$(curl -s -X POST $API_URL/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "paymentType": "topup",
    "amount": 100.00,
    "currency": "MYR",
    "gateway": "stripe"
  }')

PAYMENT_ID=$(echo $PAYMENT | jq -r '.data.paymentId')
echo "Created payment: $PAYMENT_ID"

# Test 3: Get payment details
echo "\nTest 3: Get payment details"
curl -s $API_URL/api/payments/$PAYMENT_ID \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 4: Cancel payment
echo "\nTest 4: Cancel payment"
curl -s -X POST $API_URL/api/payments/$PAYMENT_ID/cancel \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 5: Get payment list
echo "\nTest 5: Get payment list"
curl -s "$API_URL/api/payments?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "\n=== Tests completed ==="
```

Run tests:
```bash
chmod +x test-all.sh
./test-all.sh
```

## Common Issues and Solutions

### Issue 1: Payment Stuck in Pending
**Solution:** Check webhook delivery in gateway dashboard, verify webhook URL is accessible

### Issue 2: Wallet Not Credited
**Solution:** Check Wallet Service logs, verify service URL is correct, test wallet endpoint manually

### Issue 3: Signature Verification Failed
**Solution:** Verify webhook secret matches gateway dashboard, check raw body parsing for webhooks

### Issue 4: USDT Transaction Not Found
**Solution:** Wait for blockchain confirmation (1-3 minutes), verify transaction hash format, check TronGrid API key

### Issue 5: Payment Expired
**Solution:** Payments expire after 24 hours, create new payment

## Next Steps

After completing these tests:
1. ✅ All payment flows working
2. ✅ Gateway integrations validated
3. ✅ Webhook handling confirmed
4. ✅ Error handling verified
5. ✅ Wallet integration tested

Ready for:
- Production gateway setup
- Load testing
- Security audit
- Integration with Order Service
- Frontend integration

## Support

For issues:
- Check service logs: `npm run dev`
- Check database: `mongo payment-service`
- Review gateway documentation
- Test with Stripe CLI: `stripe listen`
