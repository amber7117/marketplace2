# Virtual Trading Platform - AI Agent Instructions

## Project Overview
This is a microservices-based virtual product & gift card trading platform using Node.js, Express, MongoDB, and JWT authentication. The architecture follows domain-driven design with independent services communicating through an API Gateway.

## Core Architecture Patterns

### Service Structure
Each microservice follows this consistent pattern:
- **Port allocation**: Auth (3001), Product (3002), Order (3003), Wallet (3004), Payment (3005), Notification (3006)
- **Health endpoints**: All services expose `/health` with database connection status
- **Graceful shutdown**: SIGTERM handlers with proper resource cleanup
- **Security stack**: Helmet, CORS, rate limiting, JWT validation

### API Gateway (Port 3000)
- **Proxy routing**: Uses `http-proxy-middleware` for service forwarding
- **Authentication flow**: Public routes (`/api/auth`, `/api/products`) vs protected routes (all others)
- **User context**: Injects `X-User-ID` and `X-User-Role` headers for protected services
- **Service discovery**: Dynamic URL resolution via `serviceRegistry.getServiceUrl()`

### Database Strategy
- **Per-service databases**: Each service owns its data (MongoDB collections)
- **Connection pattern**: Mongoose with `connectDB()` helper in each service
- **Health monitoring**: Database status included in health checks

## Development Workflow

### Environment Setup
```bash
# Install all service dependencies
npm run install:all

# Start all services concurrently
npm run dev

# Individual service development
npm run dev:auth  # or dev:product, dev:order, etc.
```

### Service Registration
Services auto-register with the API Gateway using environment variables:
- `AUTH_SERVICE_URL=http://localhost:3001`
- `PRODUCT_SERVICE_URL=http://localhost:3002`
- Health checks run every 30 seconds to maintain service availability

### Authentication Flow
- **JWT tokens**: Generated in auth-service with user payload
- **Middleware chain**: `authMiddleware` validates tokens before protected routes
- **User verification**: Email verification tokens for new registrations
- **Password security**: Bcrypt hashing with salt rounds

## Key Implementation Patterns

### Error Handling
All services use consistent error middleware:
```javascript
// Standard error response format
{
  success: false,
  error: "Error message",
  details: [] // Validation errors array
}
```

### Request Validation
- **express-validator**: Input validation in controllers
- **Rate limiting**: 100 requests/15min for auth, 1000 requests/15min for API Gateway
- **Body limits**: 10MB JSON/URL-encoded payloads

### Service Communication
- **HTTP proxy**: API Gateway forwards requests to service URLs
- **Header injection**: User context passed via HTTP headers, not tokens
- **Circuit breaker**: Services marked unhealthy on failed health checks

## Critical Files & Patterns

### Service Bootstrapping
- `/services/{service}/server.js`: Standard Express app with middleware chain
- `/api-gateway/src/config/serviceRegistry.js`: Dynamic service discovery
- `/api-gateway/src/routes/serviceRoutes.js`: Route-to-service mapping

### User Management
- `/services/auth-service/src/models/User.js`: Mongoose schema with pre-save hooks
- `/services/auth-service/src/controllers/authController.js`: Registration, login, token refresh

### Development Commands
- **Monorepo**: npm workspaces with service-specific package.json files
- **Concurrency**: `concurrently` package runs multiple services
- **Docker ready**: Infrastructure folder prepared for containerization

## Project-Specific Conventions

### Naming Patterns
- Services: `{domain}-service` (e.g., `auth-service`, `order-service`)
- Routes: RESTful with service prefix (`/api/auth/*`, `/api/products/*`)
- Environment vars: `{SERVICE_NAME}_SERVICE_URL` format

### Security Approach
- **CORS configuration**: Frontend URL whitelist in API Gateway
- **JWT strategy**: No refresh tokens; rely on short-lived access tokens
- **Input sanitization**: express-validator with custom validation rules

### External Integrations (Planned)
- **Payment gateways**: Stripe, Razer Gold, FPX, USDT support
- **Notifications**: Email SMTP, Telegram Bot integration
- **Caching**: Redis for session management and performance

## When Adding New Services
1. Create service in `/services/{new-service}/` following auth-service structure
2. Add service URL to `serviceRegistry.js` initialization
3. Add proxy route in `serviceRoutes.js` (public vs protected)
4. Update root `package.json` scripts for dev/install/test commands
5. Assign unique port number following sequence pattern

## Database Schema Approach
Each service maintains independent collections:
- `auth-service`: users, user_sessions
- `product-service`: products, categories, inventory
- `order-service`: orders, order_items
- `wallet-service`: wallets, transactions
- `payment-service`: payments, payment_methods
- `notification-service`: notifications, templates