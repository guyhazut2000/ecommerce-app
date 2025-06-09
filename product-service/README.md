# Product Service

A modular microservice for managing products in an e-commerce application built with Node.js, Express, TypeScript, and Prisma.

## 📁 Project Structure

```
src/
├── config/
│   └── database.ts          # Database configuration and connection
├── controllers/
│   └── product.controller.ts # HTTP request handlers
├── middleware/
│   └── errorHandler.ts      # Error handling middleware
├── routes/
│   └── product.routes.ts    # Route definitions
├── services/
│   └── product.service.ts   # Business logic layer
├── types/
│   └── product.types.ts     # TypeScript interfaces and types
├── utils/
│   └── validation.ts        # Validation utilities
├── generated/
│   └── prisma/             # Generated Prisma client
├── app.ts                  # Express app configuration
└── index.ts               # Application entry point
```

## 🚀 Features

### Product Management

- **CRUD Operations**: Create, read, update, and delete products
- **Search & Filtering**: Search by name, description, SKU, or category
- **Pagination**: Efficient data retrieval with pagination support
- **Stock Management**: Update product quantities with different operations
- **Category Management**: Organize products by categories

### Technical Features

- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Centralized error handling with custom error types
- **Validation**: Input validation with detailed error messages
- **Database**: PostgreSQL with Prisma ORM
- **Modular Architecture**: Clean separation of concerns
- **Graceful Shutdown**: Proper cleanup on application termination

## 📚 API Endpoints

### Base URL: `/api/v1`

#### Products

- `GET /products` - Get all products with filtering and pagination
- `POST /products` - Create a new product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product completely
- `PATCH /products/:id` - Update product partially
- `DELETE /products/:id` - Delete product

#### Product Search & Filtering

- `GET /products/search?q=term` - Search products
- `GET /products/category/:category` - Get products by category
- `GET /products/sku/:sku` - Get product by SKU
- `GET /products/out-of-stock` - Get out of stock products

#### Stock Management

- `POST /products/:id/stock` - Update product stock

#### System

- `GET /` - Health check and service information

## 🔧 Query Parameters

### GET /products

- `category` - Filter by category
- `inStock` - Filter by stock status (true/false)
- `search` - Search in name, description, and SKU
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

## 📝 Request/Response Examples

### Create Product

```http
POST /api/v1/products
Content-Type: application/json

{
  "name": "Smartphone X",
  "description": "Latest smartphone with advanced features",
  "price": 999.99,
  "sku": "PHONE-X-001",
  "category": "Electronics",
  "quantity": 50,
  "imageUrl": "https://example.com/image.jpg"
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "name": "Smartphone X",
    "description": "Latest smartphone with advanced features",
    "price": "999.99",
    "sku": "PHONE-X-001",
    "category": "Electronics",
    "inStock": true,
    "quantity": 50,
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Product created successfully"
}
```

### Update Stock

```http
POST /api/v1/products/:id/stock
Content-Type: application/json

{
  "quantity": 10,
  "operation": "add"  // "set", "add", or "subtract"
}
```

## 🛠️ Development

### Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/products_db"
PORT=4001
NODE_ENV=development
CORS_ORIGIN="*"
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)

## 🏗️ Architecture Patterns

### Layered Architecture

1. **Routes Layer** - HTTP route definitions and middleware
2. **Controller Layer** - Request/response handling and validation
3. **Service Layer** - Business logic and data processing
4. **Database Layer** - Data access with Prisma ORM

### Error Handling

- Custom error classes for different error types
- Centralized error handling middleware
- Consistent error response format
- Proper HTTP status codes

### Validation

- Input validation with custom validators
- Type-safe data transfer objects (DTOs)
- Business rule validation in service layer

## 🔒 Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Type safety with TypeScript

## 📈 Performance Features

- Database connection pooling
- Efficient pagination
- Indexed database queries
- Graceful shutdown handling

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📖 API Documentation

When the server is running, visit:

- Health check: `http://localhost:4001/`
- API base: `http://localhost:4001/api/v1`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.
