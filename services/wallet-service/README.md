# 💰 Wallet Service

Virtual Trading Platform - Wallet Management Service

## 📋 Overview

The Wallet Service manages user wallets, balance operations, and transaction history. It provides secure balance management, deposit/withdrawal operations, and integration with Order Service for payment processing.

## 🎯 Features

- **Wallet Management**
  - Auto-create wallet on first access
  - Balance tracking (total, frozen, available)
  - Multi-currency support (MYR, USD, SGD, THB, IDR, VND)
  - Wallet status management (active, frozen, closed)

- **Balance Operations**
  - Deposit (via multiple payment gateways)
  - Deduct (for order payments)
  - Refund (for order cancellations)
  - Balance freezing/unfreezing

- **Transaction Management**
  - Complete transaction history
  - Transaction types: deposit, withdraw, deduct, refund, transfer, fee, bonus, adjustment
  - Transaction status tracking
  - Transaction filtering and search

- **Security & Compliance**
  - Automatic wallet freezing for suspicious activity
  - Transaction amount limits
  - Balance verification
  - Audit trail

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

```bash
# Navigate to service directory
cd services/wallet-service

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Configuration

Edit `.env` file:

```env
# Server
PORT=3004
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vtp_wallet

# Service URLs
AUTH_SERVICE_URL=http://localhost:3001
NOTIFICATION_SERVICE_URL=http://localhost:3006

# Security
JWT_SECRET=your-secret-key-here

# Wallet Configuration
MIN_DEPOSIT_AMOUNT=10
MAX_DEPOSIT_AMOUNT=50000
MIN_WITHDRAW_AMOUNT=10
MAX_WITHDRAW_AMOUNT=10000
DEFAULT_CURRENCY=MYR
```

### Running the Service

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start

# Seed test data
npm run seed
```

## 📡 API Endpoints

### User Endpoints

#### Get Wallet
```http
GET /wallet
Authorization: Bearer {token}
```

**Response:**
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
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

#### Deposit to Wallet
```http
POST /wallet/deposit
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100.00,
  "paymentMethod": "stripe",
  "paymentDetails": {
    "cardLast4": "4242"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "transactionId": "TXN-L7K8M9-XY2Z",
      "type": "deposit",
      "amount": 100.00,
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

#### Get Transaction History
```http
GET /wallet/transactions?type=deposit&page=1&limit=20
Authorization: Bearer {token}
```

**Query Parameters:**
- `type` - Transaction type (deposit, withdraw, deduct, refund, etc.)
- `status` - Transaction status (pending, completed, failed, etc.)
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "transaction_id",
        "transactionId": "TXN-L7K8M9-XY2Z",
        "type": "deposit",
        "amount": 100.00,
        "balanceBefore": 1000.00,
        "balanceAfter": 1100.00,
        "status": "completed",
        "description": "Deposit via stripe",
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

#### Get Transaction by ID
```http
GET /wallet/transactions/:id
Authorization: Bearer {token}
```

### Service-to-Service Endpoints

#### Deduct from Wallet (Order Service)
```http
POST /wallet/deduct
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_id",
  "amount": 50.00,
  "reference": {
    "type": "order",
    "id": "order_id"
  },
  "description": "Purchase order VTP-123456",
  "metadata": {
    "orderId": "order_id",
    "orderNumber": "VTP-123456",
    "productName": "Steam Gift Card"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transaction": {
      "id": "transaction_id",
      "transactionId": "TXN-ABC123",
      "amount": 50.00,
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

#### Refund to Wallet (Order Service)
```http
POST /wallet/refund
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_id",
  "amount": 50.00,
  "reference": {
    "type": "order",
    "id": "order_id"
  },
  "description": "Order cancelled - refund",
  "metadata": {
    "orderId": "order_id",
    "orderNumber": "VTP-123456",
    "reason": "Order cancelled by user"
  }
}
```

### Admin Endpoints

#### Freeze Wallet
```http
POST /wallet/:userId/freeze
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Suspicious activity detected"
}
```

#### Unfreeze Wallet
```http
POST /wallet/:userId/unfreeze
Authorization: Bearer {admin_token}
```

#### Get Wallet Statistics
```http
GET /wallet/admin/stats?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer {admin_token}
```

**Response:**
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

## 🗄️ Data Models

### Wallet Schema

```javascript
{
  user: ObjectId,           // User reference
  userEmail: String,        // User email
  balance: Number,          // Total balance
  frozenBalance: Number,    // Frozen amount
  availableBalance: Number, // Available = balance - frozen
  currency: String,         // MYR, USD, SGD, etc.
  status: String,           // active, frozen, closed
  frozenReason: String,
  frozenAt: Date,
  totalDeposit: Number,
  totalWithdraw: Number,
  totalSpent: Number,
  totalRefund: Number,
  metadata: Map,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user` (unique)
- `user + status`
- `userEmail`
- `createdAt`

### Transaction Schema

```javascript
{
  transactionId: String,      // Unique ID (TXN-xxx)
  wallet: ObjectId,           // Wallet reference
  user: ObjectId,             // User reference
  type: String,               // deposit, withdraw, deduct, refund, etc.
  amount: Number,             // Transaction amount
  balanceBefore: Number,
  balanceAfter: Number,
  currency: String,
  status: String,             // pending, completed, failed, cancelled, reversed
  description: String,
  reference: {
    type: String,             // order, payment, withdrawal, etc.
    id: String
  },
  paymentMethod: String,
  paymentDetails: Object,
  metadata: Object,
  processedBy: ObjectId,
  processedAt: Date,
  failedReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `transactionId` (unique)
- `wallet + createdAt`
- `user + type`
- `user + status`
- `reference.type + reference.id`
- `createdAt`

## 🔒 Security Features

### Balance Protection
- Atomic operations for balance updates
- Available balance verification
- Frozen balance tracking
- Negative balance prevention

### Transaction Limits
- Minimum deposit: 10 (configurable)
- Maximum deposit: 50,000 (configurable)
- Minimum withdrawal: 10 (configurable)
- Maximum withdrawal: 10,000 (configurable)

### Auto-freeze Triggers
- Large transaction amounts
- Suspicious activity patterns
- Manual admin freeze

### Audit Trail
- All transactions logged
- Balance before/after tracking
- User IP and user agent tracking
- Admin action logging

## 🧪 Testing

### Test Data

Generate test wallets and transactions:

```bash
npm run seed
```

This creates:
- 3 sample wallets
- Multiple transactions per wallet
- Different transaction types
- One frozen wallet example

### Manual Testing

Use the provided curl commands in `TESTING.md` or use tools like Postman.

## 🔗 Service Integration

### Order Service Integration

Order Service calls Wallet Service for:

1. **Payment Deduction**
```javascript
POST /wallet/deduct
{
  "userId": "user_id",
  "amount": 100,
  "reference": { "type": "order", "id": "order_id" },
  "metadata": { "orderNumber": "VTP-123456" }
}
```

2. **Refund Processing**
```javascript
POST /wallet/refund
{
  "userId": "user_id",
  "amount": 100,
  "reference": { "type": "order", "id": "order_id" },
  "description": "Order cancelled"
}
```

### Notification Service Integration

Wallet Service sends notifications for:
- Successful deposits
- Refunds processed
- Wallet frozen/unfrozen
- Low balance warnings

## 📊 Performance

### Database Indexes
- Optimized for user queries
- Transaction history pagination
- Fast balance lookups

### Caching Strategy
- User wallet caching (planned)
- Transaction summary caching (planned)

## 🐛 Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| 400 | Validation failed | Check request parameters |
| 401 | Unauthorized | Provide valid token |
| 403 | Wallet frozen | Contact support |
| 404 | Wallet not found | Wallet auto-created on first access |
| 500 | Server error | Check logs |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be positive"
    }
  ]
}
```

## 📈 Monitoring

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "service": "wallet-service",
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "database": "connected"
}
```

### Metrics to Monitor
- Total balance across all wallets
- Transaction success rate
- Average transaction value
- Frozen wallet count
- Failed transaction count

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -t wallet-service .

# Run container
docker run -p 3004:3004 \
  -e MONGODB_URI=mongodb://mongo:27017/vtp_wallet \
  wallet-service
```

### Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Configure proper rate limits
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Enable transaction notifications
- [ ] Set appropriate amount limits
- [ ] Configure auto-freeze thresholds

## 📝 Development Notes

### Adding New Transaction Types

1. Add type to Transaction schema enum
2. Implement handler in controller
3. Add route with validation
4. Update documentation

### Multi-currency Support

Currently supports:
- MYR (Malaysian Ringgit)
- USD (US Dollar)
- SGD (Singapore Dollar)
- THB (Thai Baht)
- IDR (Indonesian Rupiah)
- VND (Vietnamese Dong)

To add more currencies, update the `currency` enum in Wallet schema.

## 🤝 Contributing

1. Follow existing code structure
2. Add validation for new endpoints
3. Update documentation
4. Test all edge cases

## 📄 License

MIT License - Virtual Trading Platform

---

**Service Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: October 15, 2025
