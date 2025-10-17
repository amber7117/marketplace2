# 🧪 Wallet Service Testing Guide

Complete testing guide for Wallet Service API endpoints.

## 📋 Prerequisites

1. **Start the service:**
   ```bash
   cd services/wallet-service
   npm run dev
   ```

2. **Seed test data:**
   ```bash
   npm run seed
   ```

3. **Get authentication token:**
   - Login via Auth Service to get JWT token
   - Or use test token from Auth Service

4. **Set environment variables:**
   ```bash
   export API_URL="http://localhost:3004"
   export TOKEN="your_jwt_token_here"
   export USER_ID="507f1f77bcf86cd799439011"
   ```

---

## 🧪 Test Scenarios

### 1. Health Check

**Test if service is running:**

```bash
curl -X GET http://localhost:3004/health
```

**Expected Response:**
```json
{
  "success": true,
  "service": "wallet-service",
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "database": "connected"
}
```

---

### 2. Get User Wallet

**Get current user's wallet (auto-creates if not exists):**

```bash
curl -X GET http://localhost:3004/wallet \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": "wallet_id",
      "balance": 1000.00,
      "frozenBalance": 0,
      "availableBalance": 1000.00,
      "currency": "MYR",
      "status": "active",
      "totalDeposit": 5000.00,
      "totalWithdraw": 500.00,
      "totalSpent": 3500.00,
      "totalRefund": 0,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 3. Deposit to Wallet

**Deposit MYR 100 via Stripe:**

```bash
curl -X POST http://localhost:3004/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "paymentMethod": "stripe",
    "paymentDetails": {
      "cardLast4": "4242",
      "brand": "Visa"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "transactionId": "TXN-L7K8M9-XY2Z",
      "type": "deposit",
      "amount": 100,
      "status": "completed",
      "balanceAfter": 1100.00,
      "createdAt": "2025-01-15T10:30:00.000Z"
    },
    "wallet": {
      "balance": 1100.00,
      "availableBalance": 1100.00
    }
  }
}
```

**Test different payment methods:**

```bash
# Razer Gold
curl -X POST http://localhost:3004/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50,
    "paymentMethod": "razer"
  }'

# FPX (Malaysian Banking)
curl -X POST http://localhost:3004/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 200,
    "paymentMethod": "fpx",
    "paymentDetails": {
      "bank": "Maybank"
    }
  }'

# USDT
curl -X POST http://localhost:3004/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "paymentMethod": "usdt",
    "paymentDetails": {
      "txHash": "0x123abc..."
    }
  }'
```

---

### 4. Deduct from Wallet (Service-to-Service)

**Deduct for order payment:**

```bash
curl -X POST http://localhost:3004/wallet/deduct \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "amount": 50,
    "reference": {
      "type": "order",
      "id": "order_id_123"
    },
    "description": "Purchase order VTP-123456",
    "metadata": {
      "orderId": "order_id_123",
      "orderNumber": "VTP-123456",
      "productName": "Steam Gift Card $50"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "transactionId": "TXN-ABC123",
      "amount": 50,
      "status": "completed",
      "balanceAfter": 1050.00
    },
    "wallet": {
      "balance": 1050.00,
      "availableBalance": 1050.00
    }
  }
}
```

---

### 5. Refund to Wallet (Service-to-Service)

**Process refund for cancelled order:**

```bash
curl -X POST http://localhost:3004/wallet/refund \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "amount": 50,
    "reference": {
      "type": "order",
      "id": "order_id_123"
    },
    "description": "Order cancelled - refund",
    "metadata": {
      "orderId": "order_id_123",
      "orderNumber": "VTP-123456",
      "reason": "Customer requested cancellation"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "transactionId": "TXN-REF456",
      "amount": 50,
      "status": "completed",
      "balanceAfter": 1100.00
    },
    "wallet": {
      "balance": 1100.00,
      "availableBalance": 1100.00
    }
  }
}
```

---

### 6. Get Transaction History

**Get all transactions:**

```bash
curl -X GET "http://localhost:3004/wallet/transactions" \
  -H "Authorization: Bearer $TOKEN"
```

**Get deposits only:**

```bash
curl -X GET "http://localhost:3004/wallet/transactions?type=deposit" \
  -H "Authorization: Bearer $TOKEN"
```

**Get transactions with pagination:**

```bash
curl -X GET "http://localhost:3004/wallet/transactions?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

**Get transactions by date range:**

```bash
curl -X GET "http://localhost:3004/wallet/transactions?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

**Get completed transactions only:**

```bash
curl -X GET "http://localhost:3004/wallet/transactions?status=completed" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "transactionId": "TXN-L7K8M9-XY2Z",
        "type": "deposit",
        "amount": 100,
        "balanceBefore": 1000.00,
        "balanceAfter": 1100.00,
        "status": "completed",
        "description": "Deposit via stripe",
        "reference": null,
        "createdAt": "2025-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

---

### 7. Get Transaction by ID

**Get specific transaction details:**

```bash
curl -X GET "http://localhost:3004/wallet/transactions/transaction_id_here" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "transactionId": "TXN-L7K8M9-XY2Z",
      "wallet": "wallet_id",
      "user": "user_id",
      "type": "deposit",
      "amount": 100,
      "balanceBefore": 1000.00,
      "balanceAfter": 1100.00,
      "currency": "MYR",
      "status": "completed",
      "description": "Deposit via stripe",
      "paymentMethod": "stripe",
      "paymentDetails": {
        "cardLast4": "4242"
      },
      "metadata": {
        "ip": "127.0.0.1"
      },
      "processedAt": "2025-01-15T10:30:00.000Z",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 8. Freeze Wallet (Admin Only)

**Freeze a user's wallet:**

```bash
curl -X POST "http://localhost:3004/wallet/507f1f77bcf86cd799439011/freeze" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Suspicious activity detected - multiple failed transactions"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wallet frozen successfully",
  "data": {
    "wallet": {
      "id": "wallet_id",
      "status": "frozen",
      "frozenReason": "Suspicious activity detected - multiple failed transactions",
      "frozenAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

---

### 9. Unfreeze Wallet (Admin Only)

**Unfreeze a user's wallet:**

```bash
curl -X POST "http://localhost:3004/wallet/507f1f77bcf86cd799439011/unfreeze" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Wallet unfrozen successfully",
  "data": {
    "wallet": {
      "id": "wallet_id",
      "status": "active"
    }
  }
}
```

---

### 10. Get Wallet Statistics (Admin Only)

**Get overall wallet statistics:**

```bash
curl -X GET "http://localhost:3004/wallet/admin/stats" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Get statistics for specific date range:**

```bash
curl -X GET "http://localhost:3004/wallet/admin/stats?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "wallets": {
      "total": 1000,
      "active": 980,
      "frozen": 15,
      "closed": 5
    },
    "balance": {
      "total": 500000.00,
      "frozen": 5000.00,
      "available": 495000.00
    },
    "transactions": {
      "deposit": {
        "count": 5000,
        "total": 1000000.00
      },
      "deduct": {
        "count": 8000,
        "total": 450000.00
      },
      "refund": {
        "count": 200,
        "total": 10000.00
      }
    }
  }
}
```

---

## ❌ Error Scenarios

### 1. Insufficient Balance

```bash
curl -X POST http://localhost:3004/wallet/deduct \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "amount": 999999,
    "description": "Test insufficient balance"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Insufficient balance",
  "data": {
    "required": 999999,
    "available": 1000.00
  }
}
```

---

### 2. Invalid Deposit Amount

**Below minimum:**

```bash
curl -X POST http://localhost:3004/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5,
    "paymentMethod": "stripe"
  }'
```

**Above maximum:**

```bash
curl -X POST http://localhost:3004/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000,
    "paymentMethod": "stripe"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Deposit amount must be between 10 and 50000"
}
```

---

### 3. Frozen Wallet

**Try to deposit to frozen wallet:**

```bash
curl -X POST http://localhost:3004/wallet/deposit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "paymentMethod": "stripe"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Wallet is frozen. Please contact support."
}
```

---

### 4. Unauthorized Access

**No token:**

```bash
curl -X GET http://localhost:3004/wallet
```

**Expected Response:**
```json
{
  "success": false,
  "error": "No token provided. Authorization denied."
}
```

**Invalid token:**

```bash
curl -X GET http://localhost:3004/wallet \
  -H "Authorization: Bearer invalid_token"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid token. Authorization denied."
}
```

---

### 5. Validation Errors

**Missing required fields:**

```bash
curl -X POST http://localhost:3004/wallet/deduct \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011"
  }'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be a positive number"
    }
  ]
}
```

---

## 🔄 Integration Test Flow

### Complete Order Payment Flow

**1. Get initial wallet balance:**
```bash
curl -X GET http://localhost:3004/wallet \
  -H "Authorization: Bearer $TOKEN"
```

**2. Deduct for order:**
```bash
curl -X POST http://localhost:3004/wallet/deduct \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "amount": 50,
    "reference": {"type": "order", "id": "test_order_123"},
    "description": "Test order purchase"
  }'
```

**3. Verify balance decreased:**
```bash
curl -X GET http://localhost:3004/wallet \
  -H "Authorization: Bearer $TOKEN"
```

**4. Cancel order and refund:**
```bash
curl -X POST http://localhost:3004/wallet/refund \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "507f1f77bcf86cd799439011",
    "amount": 50,
    "reference": {"type": "order", "id": "test_order_123"},
    "description": "Order cancelled"
  }'
```

**5. Verify balance restored:**
```bash
curl -X GET http://localhost:3004/wallet \
  -H "Authorization: Bearer $TOKEN"
```

**6. Check transaction history:**
```bash
curl -X GET "http://localhost:3004/wallet/transactions" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Performance Testing

### Load Test with Apache Bench

```bash
# Test wallet retrieval
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3004/wallet

# Test transaction history
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3004/wallet/transactions
```

### Stress Test Concurrent Deposits

```bash
# Run 100 concurrent deposit requests
for i in {1..100}; do
  curl -X POST http://localhost:3004/wallet/deposit \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"amount": 10, "paymentMethod": "stripe"}' &
done
wait
```

---

## ✅ Test Checklist

### Basic Functionality
- [ ] Health check returns 200
- [ ] Get wallet auto-creates if not exists
- [ ] Deposit increases balance
- [ ] Deduct decreases balance
- [ ] Refund increases balance
- [ ] Transaction history shows all operations
- [ ] Transaction filters work correctly

### Security & Validation
- [ ] Unauthorized requests return 401
- [ ] Admin endpoints require admin role
- [ ] Amount validation works
- [ ] Insufficient balance is caught
- [ ] Frozen wallet blocks operations

### Edge Cases
- [ ] Negative amounts are rejected
- [ ] Zero amounts are rejected
- [ ] Very large amounts are handled
- [ ] Concurrent deductions don't cause negative balance
- [ ] Duplicate transaction IDs are prevented

### Integration
- [ ] Order Service can deduct successfully
- [ ] Order Service can refund successfully
- [ ] Notifications are sent (check Notification Service logs)

---

## 🐛 Troubleshooting

### Wallet not found
- Check if user is authenticated
- Wallet is auto-created on first GET request

### Transaction failed
- Check MongoDB connection
- Verify sufficient balance
- Check wallet status (not frozen)

### Notification not sent
- Verify Notification Service is running
- Check NOTIFICATION_SERVICE_URL in .env
- Review service logs

---

## 📝 Notes

1. **Test Data**: Use `npm run seed` to generate test wallets
2. **Transaction IDs**: Auto-generated in format `TXN-{timestamp}-{random}`
3. **Balance Updates**: Atomic operations prevent race conditions
4. **Frozen Wallets**: Can only be managed by admins

---

**Happy Testing!** 🧪✨

For issues or questions, check the logs or contact the development team.
