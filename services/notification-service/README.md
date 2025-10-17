# Notification Service

Multi-channel notification service supporting email (SMTP) and Telegram Bot for Virtual Trading Platform.

## Features

- **Multi-Channel Support**
  - Email (SMTP with Nodemailer)
  - Telegram Bot
  
- **Notification Types**
  - Order notifications (created, paid, delivered, cancelled)
  - Payment notifications (completed, failed, refunded)
  - Wallet notifications (deposit, withdrawal)
  - System announcements
  - Promotional messages

- **User Preferences**
  - Channel selection per category
  - Enable/disable notification types
  - Email and Telegram account linking

- **Template Management**
  - Handlebars template engine
  - Dynamic variable substitution
  - Template testing and validation

- **Background Jobs**
  - Auto-process pending notifications
  - Retry failed notifications with backoff
  - TTL-based cleanup (90 days)

## Tech Stack

- Node.js 18+ with Express
- MongoDB with Mongoose
- Nodemailer (Email)
- node-telegram-bot-api (Telegram)
- Handlebars (Templates)

## Environment Setup

Create `.env` from `.env.example`:

```env
PORT=3006
MONGODB_URI=mongodb://localhost:27017/notification-service
JWT_SECRET=your-jwt-secret

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@trading-platform.com

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_ADMIN_CHAT_ID=123456789

# Features
ENABLE_TELEGRAM_POLLING=false
ENABLE_BACKGROUND_JOBS=true
MAX_RETRY_ATTEMPTS=3
```

## Installation

```bash
npm install
npm start  # Production
npm run dev  # Development with nodemon
```

## API Endpoints

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications` | Create notification |
| GET | `/api/notifications` | List user notifications |
| GET | `/api/notifications/:id` | Get notification details |
| POST | `/api/notifications/:id/resend` | Resend failed notification |
| POST | `/api/notifications/test` | Send test notification |
| GET | `/api/notifications/stats` | Get statistics (admin) |

### Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/preferences` | Get user preferences |
| PUT | `/api/notifications/preferences` | Update preferences |
| PUT | `/api/notifications/preferences/email` | Update email address |
| PUT | `/api/notifications/preferences/telegram` | Link Telegram account |
| PUT | `/api/notifications/preferences/:type` | Toggle notification type |
| PUT | `/api/notifications/preferences/channel/:category` | Set preferred channel |

### Templates (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/templates` | List all templates |
| GET | `/api/notifications/templates/:name` | Get template |
| POST | `/api/notifications/templates` | Create template |
| PUT | `/api/notifications/templates/:name` | Update template |
| DELETE | `/api/notifications/templates/:name` | Delete template |
| POST | `/api/notifications/templates/:name/test` | Test template |

## Quick Start Examples

### Create Notification

```bash
curl -X POST http://localhost:3006/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "userId": "user123",
    "type": "payment_completed",
    "subject": "Payment Successful",
    "content": {
      "text": "Your payment of MYR 100 has been processed.",
      "html": "<p>Your payment of <strong>MYR 100</strong> has been processed.</p>"
    },
    "channel": "both",
    "priority": "high",
    "metadata": {
      "referenceId": "PAY-123",
      "referenceType": "payment"
    }
  }'
```

### Get User Preferences

```bash
curl http://localhost:3006/api/notifications/preferences \
  -H "Authorization: Bearer $TOKEN"
```

### Link Telegram Account

```bash
curl -X PUT http://localhost:3006/api/notifications/preferences/telegram \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "chatId": "123456789",
    "username": "johndoe"
  }'
```

### Send Test Notification

```bash
curl -X POST http://localhost:3006/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "channel": "both"
  }'
```

## Email Setup (Gmail)

1. Enable 2-Step Verification in Google Account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `SMTP_PASSWORD`

## Telegram Bot Setup

1. Create bot with [@BotFather](https://t.me/botfather)
2. Get bot token
3. Start bot and send `/start`
4. Get your Chat ID from bot response
5. Add token and Chat ID to `.env`

## Notification Flow

```
1. Service → POST /api/notifications (create)
2. Check user preferences
3. Determine channel (email/telegram/both)
4. Send via providers
5. Update delivery status
6. Retry on failure (max 3 attempts)
```

## Template Variables

Example template with variables:

```handlebars
Subject: Order Confirmation - {{orderId}}

Hi {{userName}},

Your order {{orderId}} has been confirmed!
Total: {{currency}} {{amount}}
Status: {{status}}

View Order: {{frontendUrl}}/orders/{{orderId}}
```

## Background Jobs

- **Process Pending**: Every 1 minute
- **Retry Failed**: Every 5 minutes
- **Auto-cleanup**: TTL index (90 days)

## Integration with Other Services

### Order Service Example

```javascript
// In order-service
const axios = require('axios');

async function notifyOrderCreated(order, userId) {
  await axios.post('http://localhost:3006/api/notifications', {
    userId,
    type: 'order_created',
    subject: `Order Confirmation - ${order.orderId}`,
    content: {
      text: `Your order ${order.orderId} has been created.`,
    },
    metadata: {
      referenceId: order.orderId,
      referenceType: 'order',
    },
  });
}
```

## Database Schema

### Notification
- notificationId, userId, type, channel
- status (pending/sent/failed/cancelled)
- recipient (email, telegramChatId)
- content (text, html)
- delivery tracking
- retry count, timestamps

### NotificationPreference
- userId, email settings, telegram settings
- preferences per type
- channel preferences per category
- timezone, language

### NotificationTemplate
- name, type, channel
- subject, email/telegram templates
- variables with validation
- active status

## Monitoring

Health check: `GET /health`

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

## Deployment

```bash
# Build and run
npm install
npm start

# With Docker
docker build -t notification-service .
docker run -p 3006:3006 --env-file .env notification-service
```

## Security

- JWT authentication on all routes
- Rate limiting (1000 req/15min)
- Helmet.js security headers
- Input validation with express-validator

## License

ISC
