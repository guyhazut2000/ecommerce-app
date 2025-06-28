# Product Service Architecture

This document outlines the clean architecture pattern implemented in the Product Service, featuring Prisma + Zod integration for type-safe database operations and runtime validation.

## 🏗️ Architecture Overview

```
src/
├── api/                    # HTTP layer (Express)
│   ├── routes/            # Route definitions
│   ├── controllers/       # Request/Response handlers
│   ├── middlewares/       # Auth, validation, error handling
│   └── validators/        # Zod schemas for validation
│
├── services/              # Business logic layer
├── repositories/          # Data access layer (Prisma)
├── config/               # Configuration (DB, env, etc.)
├── types/                # TypeScript types & interfaces
├── utils/                # Helper functions
├── app.ts                # Express app setup
└── server.ts             # Server entry point
```

## 🔄 Layer Integration

| Layer              | Tool    | Purpose                                  |
| ------------------ | ------- | ---------------------------------------- |
| **DB Access**      | Prisma  | Type-safe database client                |
| **Validation**     | Zod     | Runtime + compile-time schema validation |
| **Business Logic** | Service | Pure business logic using validated data |
| **HTTP Layer**     | Express | Request/Response handling                |

## 📁 Directory Structure

### `/api` - HTTP Layer

- **`routes/`**: Express route definitions
- **`controllers/`**: Handle HTTP requests, call services
- **`middlewares/`**: Validation, error handling, authentication
- **`validators/`**: Zod schemas for input validation

### `/services` - Business Logic

- Contains pure business logic
- Independent of HTTP framework
- Uses validated data from controllers
- Calls repository methods

### `/repositories` - Data Access

- Prisma database operations
- Type-safe queries
- Database abstraction layer

### `/config` - Configuration

- Database connection
- Environment variables
- App configuration

### `/types` - Type Definitions

- API response types
- Zod inferred types
- Shared interfaces

## 🔧 Key Components

### 1. Zod Validation (`/api/validators`)

```typescript
// product.validators.ts
export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be positive"),
  sku: z.string().min(1, "SKU is required"),
  // ... other fields
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
```

**Benefits:**

- Runtime validation
- Type inference
- Automatic error messages
- Schema composition

### 2. Repository Pattern (`/repositories`)

```typescript
// product.repository.ts
export class ProductRepository {
  private prisma = databaseService.getInstance().getPrismaClient();

  async create(data: CreateProductInput): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  async findAll(
    query: ProductQuery
  ): Promise<{ products: Product[]; total: number }> {
    // Complex queries with pagination, filtering, sorting
  }
}
```

**Benefits:**

- Database abstraction
- Type-safe operations
- Reusable queries
- Testable data access

### 3. Service Layer (`/services`)

```typescript
// product.service.ts
export class ProductService {
  private productRepository: ProductRepository;

  async createProduct(data: CreateProductInput): Promise<Product> {
    // Business logic: Validate SKU uniqueness
    const existingProduct = await this.productRepository.findBySku(data.sku);
    if (existingProduct) {
      throw new Error(`Product with SKU ${data.sku} already exists`);
    }

    // Business logic: Set default quantity
    const productData = {
      ...data,
      quantity: data.quantity || 0,
      inStock: data.quantity > 0,
    };

    return this.productRepository.create(productData);
  }
}
```

**Benefits:**

- Pure business logic
- Independent of HTTP
- Easy to test
- Reusable across different interfaces

### 4. Controller Layer (`/api/controllers`)

```typescript
// product-controller.ts
export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const productData = createProductSchema.parse(req.body);
    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  }
);
```

**Benefits:**

- Thin HTTP layer
- Automatic error handling
- Consistent response format
- Input validation

### 5. Middleware (`/api/middlewares`)

```typescript
// validation.middleware.ts
export const validateBody = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid request body",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
    }
  };
};
```

**Benefits:**

- Centralized validation
- Consistent error responses
- Reusable across routes
- Type safety

## 🚀 Data Flow

1. **Request** → Express Router
2. **Validation** → Zod Schema (middleware)
3. **Controller** → Parse validated data, call service
4. **Service** → Business logic, call repository
5. **Repository** → Prisma database operations
6. **Response** → Consistent API response format

## 🧪 Testing Strategy

### Unit Tests

- **Services**: Test business logic in isolation
- **Repositories**: Mock Prisma client
- **Validators**: Test Zod schemas

### Integration Tests

- **Controllers**: Test HTTP layer with mocked services
- **API Endpoints**: End-to-end testing with test database

### Test Structure

```
tests/
├── unit/
│   ├── services/
│   ├── repositories/
│   └── validators/
├── integration/
│   ├── controllers/
│   └── api/
└── e2e/
```

## 🔒 Error Handling

### Error Types

- **ValidationError**: Invalid input data
- **NotFoundError**: Resource not found
- **ConflictError**: Business rule violations
- **PrismaError**: Database operation failures

### Error Response Format

```typescript
{
  success: false,
  message: "Error description",
  errors?: [
    {
      field: "fieldName",
      message: "Validation message",
      code: "VALIDATION_ERROR"
    }
  ]
}
```

## 📊 API Response Format

### Success Response

```typescript
{
  success: true,
  data: T,
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number,
    hasNext: boolean,
    hasPrev: boolean
  }
}
```

### Pagination

- Query parameters: `page`, `limit`
- Sorting: `sortBy`, `sortOrder`
- Filtering: `category`, `search`, `minPrice`, `maxPrice`

## 🔧 Configuration

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/db
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

### Database Configuration

- Prisma client with connection pooling
- Development logging
- Health check endpoint
- Graceful shutdown

## 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup database**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## 📈 Benefits of This Architecture

1. **Type Safety**: Full TypeScript + Prisma + Zod integration
2. **Maintainability**: Clear separation of concerns
3. **Testability**: Each layer can be tested independently
4. **Scalability**: Easy to add new features and endpoints
5. **Consistency**: Standardized error handling and responses
6. **Performance**: Optimized database queries with Prisma
7. **Developer Experience**: Great IntelliSense and error messages

## 🔄 Future Enhancements

- **Caching**: Redis integration for frequently accessed data
- **Event Bus**: Publish events for other services
- **Rate Limiting**: API rate limiting middleware
- **Authentication**: JWT-based authentication
- **Monitoring**: Health checks and metrics
- **Documentation**: OpenAPI/Swagger documentation
