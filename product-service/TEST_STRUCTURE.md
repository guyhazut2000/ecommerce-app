# Test Structure Guide

## 🧪 **YES, Tests Should Include Subfolders!**

The clean architecture pattern requires organized tests that mirror your source structure. Here's the recommended test organization:

## 📁 **Complete Test Directory Structure**

```
src/tests/
├── unit/                           # Fast, isolated tests
│   ├── services/                   # Business logic tests
│   │   └── product.service.test.ts
│   ├── repositories/               # Data access tests (mocked)
│   │   └── product.repository.test.ts
│   ├── validators/                 # Zod schema tests
│   │   └── product.validators.test.ts
│   └── utils/                      # Utility function tests
│       └── validation.test.ts
│
├── integration/                    # Component interaction tests
│   ├── api/                       # Full API endpoint tests
│   │   └── product.api.test.ts
│   ├── controllers/               # Controller + service tests
│   │   └── product.controller.test.ts
│   └── database/                  # Real database tests
│       └── product.integration.test.ts
│
├── e2e/                           # End-to-end workflow tests
│   └── product.e2e.test.ts
│
├── middleware/                    # Middleware-specific tests
│   ├── error-handler.test.ts
│   └── validation.middleware.test.ts
│
├── fixtures/                      # Test data and mocks
│   ├── data/
│   │   └── products.json
│   └── mocks/
│       ├── prisma.mock.ts
│       ├── services.mock.ts
│       └── database.mock.ts
│
├── helpers/                       # Test utilities
│   ├── test-server.ts
│   ├── database-setup.ts
│   └── mock-factory.ts
│
└── setup.ts                      # Global test configuration
```

## 🎯 **Why Subfolders Are Essential**

### **1. Test Types Need Different Configurations**

#### **Unit Tests (`/unit`)**

- **Fast execution** (< 1ms per test)
- **Heavy mocking** of dependencies
- **No database** connections
- **Isolated components** testing

#### **Integration Tests (`/integration`)**

- **Medium execution** (< 100ms per test)
- **Light mocking** of external services
- **Test database** for real data operations
- **Component interaction** testing

#### **E2E Tests (`/e2e`)**

- **Slow execution** (< 5s per test)
- **Minimal mocking** - real services
- **Full application** stack
- **User workflow** testing

### **2. Clear Test Organization**

```typescript
// Unit test example - isolated business logic
describe("ProductService", () => {
  it("should validate SKU uniqueness", async () => {
    // Test pure business logic with mocked repository
  });
});

// Integration test example - component interaction
describe("Product API Integration", () => {
  it("should create product via HTTP endpoint", async () => {
    // Test HTTP → Controller → Service → Repository flow
  });
});

// E2E test example - full workflow
describe("Product Management E2E", () => {
  it("should complete product lifecycle", async () => {
    // Test: Create → Read → Update → Delete workflow
  });
});
```

### **3. Parallel Test Execution**

Different test types can run in parallel:

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest src/tests/unit",
    "test:integration": "jest src/tests/integration",
    "test:e2e": "jest src/tests/e2e",
    "test:watch": "jest --watch src/tests/unit",
    "test:coverage": "jest --coverage"
  }
}
```

## 🔧 **Jest Configuration for Subfolders**

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/src/tests/unit/**/*.test.ts"],
      setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/src/tests/integration/**/*.test.ts"],
      setupFilesAfterEnv: ["<rootDir>/src/tests/helpers/database-setup.ts"],
    },
    {
      displayName: "e2e",
      testMatch: ["<rootDir>/src/tests/e2e/**/*.test.ts"],
      setupFilesAfterEnv: ["<rootDir>/src/tests/helpers/test-server.ts"],
    },
  ],
};
```

## 📋 **Test Naming Conventions**

### **File Naming**

- `*.test.ts` - All test files
- `*.mock.ts` - Mock implementations
- `*.fixture.ts` - Test data

### **Test Structure**

```typescript
describe("ComponentName", () => {
  describe("methodName", () => {
    it("should do something when condition", () => {
      // Test implementation
    });

    it("should handle error when invalid input", () => {
      // Error case testing
    });
  });
});
```

## 🚀 **Benefits of Organized Test Structure**

### **1. Maintainability**

- Easy to find relevant tests
- Clear test categories
- Consistent organization

### **2. Performance**

- Run only needed test types
- Parallel execution
- Fast feedback loops

### **3. CI/CD Integration**

```yaml
# GitHub Actions example
- name: Run Unit Tests
  run: npm run test:unit

- name: Run Integration Tests
  run: npm run test:integration

- name: Run E2E Tests
  run: npm run test:e2e
```

### **4. Developer Experience**

- Quick unit test feedback
- Focused testing during development
- Clear test failure locations

## 📊 **Test Coverage by Layer**

| Layer         | Test Type          | Coverage Target | Speed     |
| ------------- | ------------------ | --------------- | --------- |
| Validators    | Unit               | 100%            | ⚡ Fast   |
| Services      | Unit               | 95%             | ⚡ Fast   |
| Repositories  | Unit + Integration | 90%             | 🚀 Medium |
| Controllers   | Integration        | 85%             | 🚀 Medium |
| API Endpoints | E2E                | 80%             | 🐌 Slow   |

## 🎯 **Getting Started**

1. **Create the subfolder structure**
2. **Configure Jest for multiple projects**
3. **Start with unit tests** (fastest feedback)
4. **Add integration tests** for critical paths
5. **Add E2E tests** for user workflows

## 💡 **Best Practices**

1. **Test Pyramid**: More unit tests, fewer E2E tests
2. **Independent Tests**: Each test should be isolated
3. **Descriptive Names**: Clear test descriptions
4. **Fast Feedback**: Unit tests should run quickly
5. **Realistic Data**: Use realistic test fixtures

The subfolder structure is **essential** for maintaining a clean, scalable test suite that grows with your application!
