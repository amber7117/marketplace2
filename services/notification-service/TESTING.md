# Notification Service Testing Guide

## Setup

```bash
# Start service
cd services/notification-service
npm install
npm run dev

# MongoDB should be running
mongod
```

## Authentication

Get JWT token from Auth Service first:

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}' \
  | jq -r '.token')
```

## Test 1: Create Email Notification

```bash
curl -X POST http://localhost:3006/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "user123",
    "type": "order_created",
    "subject": "Order Confirmation",
    "content": {
      "text": "Your order has been created",
      "html": "<h2>Order Confirmation</h2><p>Your order has been created</p>"
    },
    "channel": "email",
    "priority": "normal",
    "metadata": {
      "referenceId": "ORD-123",
      "referenceType": "order"
    }
  }'
```

## Test 2: Get User Notifications

```bash
curl http://localhost:3006/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# With filters
curl "http://localhost:3006/api/notifications?type=order_created&status=sent&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

## Test 3: Get Notification Preferences

```bash
curl http://localhost:3006/api/notifications/preferences \
  -H "Authorization: Bearer $TOKEN"
```

## Test 4: Update Email Address

```bash
curl -X PUT http://localhost:3006/api/notifications/preferences/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "newemail@example.com"
  }'
```

## Test 5: Link Telegram Account

```bash
# 1. Start Telegram bot and send /start
# 2. Copy your Chat ID
# 3. Link account

curl -X PUT http://localhost:3006/api/notifications/preferences/telegram \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chatId": "123456789",
    "username": "johndoe"
  }'
```

## Test 6: Send Test Notification

```bash
# Test both channels
curl -X POST http://localhost:3006/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "both"
  }'

# Test email only
curl -X POST http://localhost:3006/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "email"
  }'
```

## Test 7: Toggle Notification Type

```bash
# Disable order notifications
curl -X PUT http://localhost:3006/api/notifications/preferences/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "enabled": false
  }'
```

## Test 8: Set Preferred Channel

```bash
curl -X PUT http://localhost:3006/api/notifications/preferences/channel/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "telegram"
  }'
```

## Test 9: Create Template (Admin)

```bash
curl -X POST http://localhost:3006/api/notifications/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "custom_order_notification",
    "type": "order_created",
    "channel": "both",
    "subject": "Order {{orderId}} Confirmed",
    "emailTemplate": {
      "html": "<h2>Order Confirmation</h2><p>Order ID: {{orderId}}</p>",
      "text": "Order ID: {{orderId}}"
    },
    "telegramTemplate": {
      "text": "🛒 Order {{orderId}} confirmed!",
      "parseMode": "Markdown"
    },
    "variables": [
      {
        "name": "orderId",
        "description": "Order ID",
        "required": true
      }
    ]
  }'
```

## Test 10: Test Template Rendering

```bash
curl -X POST http://localhost:3006/api/notifications/templates/custom_order_notification/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "data": {
      "orderId": "ORD-123456",
      "amount": "99.90",
      "currency": "MYR"
    }
  }'
```

## Test 11: Get Notification Statistics

```bash
curl http://localhost:3006/api/notifications/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# With date range
curl "http://localhost:3006/api/notifications/stats?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

## Test 12: Resend Failed Notification

```bash
NOTIFICATION_ID="NOTIF-ABC123"

curl -X POST http://localhost:3006/api/notifications/$NOTIFICATION_ID/resend \
  -H "Authorization: Bearer $TOKEN"
```

## Integration Tests

### Order Created Notification

```bash
# Simulate order service sending notification
curl -X POST http://localhost:3006/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "user123",
    "type": "order_created",
    "subject": "Order Confirmation - ORD-123",
    "content": {
      "text": "Your order ORD-123 for MYR 99.90 has been created."
    },
    "metadata": {
      "referenceId": "ORD-123",
      "referenceType": "order",
      "additionalData": {
        "orderId": "ORD-123",
        "amount": 99.90,
        "currency": "MYR"
      }
    }
  }'
```

### Payment Completed Notification

```bash
curl -X POST http://localhost:3006/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "user123",
    "type": "payment_completed",
    "subject": "Payment Successful",
    "content": {
      "text": "Your payment of MYR 100 has been processed successfully."
    },
    "channel": "both",
    "priority": "high",
    "metadata": {
      "referenceId": "PAY-123",
      "referenceType": "payment"
    }
  }'
```

## Telegram Bot Commands

Test these in Telegram:

```
/start - Get your Chat ID
/help - Show available commands
/status - Check notification status
/notify - Enable notifications
/stop - Disable notifications
```

## Email Testing

Use Gmail test account or [Mailtrap](https://mailtrap.io/) for testing:

```env
# Mailtrap settings
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
```

## Health Check

```bash
curl http://localhost:3006/health
```

Expected:
```json
{
  "success": true,
  "service": "notification-service",
  "status": "healthy",
  "database": "connected",
  "providers": {
    "email": true,
    "telegram": true
  }
}
```

## Background Jobs Testing

### Trigger Manual Processing

```bash
# Process pending notifications
curl -X POST http://localhost:3006/api/notifications/process \
  -H "Authorization: Bearer $TOKEN"

# Retry failed notifications
curl -X POST http://localhost:3006/api/notifications/retry \
  -H "Authorization: Bearer $TOKEN"
```

## Error Scenarios

### Missing Token

```bash
curl -X POST http://localhost:3006/api/notifications \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 401 Unauthorized
```

### Invalid Notification Type

```bash
curl -X POST http://localhost:3006/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "user123",
    "type": "invalid_type",
    "subject": "Test",
    "content": {"text": "Test"}
  }'

# Expected: 400 Validation Error
```

### Unconfigured Email

If SMTP not configured:
```bash
curl -X POST http://localhost:3006/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"channel": "email"}'

# Expected: Email provider not configured error
```

## Performance Testing

```bash
# Create 100 notifications
for i in {1..100}; do
  curl -X POST http://localhost:3006/api/notifications \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"userId\": \"user123\",
      \"type\": \"system_announcement\",
      \"subject\": \"Test $i\",
      \"content\": {\"text\": \"Test notification $i\"}
    }" &
done
wait
```

## Automated Test Script

Create `test-all.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3006"
TOKEN="your-jwt-token"

echo "=== Notification Service Tests ==="

# Test 1: Health
echo "\n1. Health Check"
curl -s $API_URL/health | jq

# Test 2: Get Preferences
echo "\n2. Get Preferences"
curl -s $API_URL/api/notifications/preferences \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 3: Send Test Notification
echo "\n3. Send Test"
curl -s -X POST $API_URL/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"channel":"both"}' | jq

# Test 4: Get Notifications
echo "\n4. Get Notifications"
curl -s "$API_URL/api/notifications?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq

echo "\n=== Tests Complete ==="
```

Run: `chmod +x test-all.sh && ./test-all.sh`

## Common Issues

1. **Email not sending**: Check SMTP credentials, enable "Less secure app access" for Gmail
2. **Telegram bot not responding**: Verify bot token, check polling is enabled
3. **Notifications not processing**: Check background jobs are enabled
4. **Database connection failed**: Ensure MongoDB is running

## License

ISC
