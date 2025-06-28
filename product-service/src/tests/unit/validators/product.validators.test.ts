import { describe, it, expect } from "@jest/globals";
import {
  productSchema,
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdSchema,
} from "../../../api/validators/product.validators";

describe("Product Validators", () => {
  describe("createProductSchema", () => {
    it("should validate a valid product creation request", () => {
      const validProduct = {
        name: "Test Product",
        description: "A test product description",
        price: 29.99,
        sku: "TEST-001",
        category: "Electronics",
        quantity: 10,
        inStock: true,
        imageUrl: "https://example.com/image.jpg",
      };

      const result = createProductSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should reject invalid price", () => {
      const invalidProduct = {
        name: "Test Product",
        price: -10, // Invalid negative price
        sku: "TEST-001",
        category: "Electronics",
        quantity: 10,
      };

      const result = createProductSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("positive");
      }
    });

    it("should reject missing required fields", () => {
      const incompleteProduct = {
        name: "Test Product",
        // Missing required fields: price, sku, category
      };

      const result = createProductSchema.safeParse(incompleteProduct);
      expect(result.success).toBe(false);
    });

    it("should handle optional fields correctly", () => {
      const minimalProduct = {
        name: "Test Product",
        price: 29.99,
        sku: "TEST-001",
        category: "Electronics",
        quantity: 10,
        // description and imageUrl are optional
      };

      const result = createProductSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);
    });
  });

  describe("productQuerySchema", () => {
    it("should validate valid query parameters", () => {
      const validQuery = {
        page: "1",
        limit: "10",
        category: "Electronics",
        search: "laptop",
        minPrice: "100",
        maxPrice: "1000",
        sortBy: "price",
        sortOrder: "asc",
      };

      const result = productQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.minPrice).toBe(100);
      }
    });

    it("should apply default values", () => {
      const emptyQuery = {};

      const result = productQuerySchema.safeParse(emptyQuery);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sortBy).toBe("createdAt");
        expect(result.data.sortOrder).toBe("desc");
      }
    });

    it("should reject invalid enum values", () => {
      const invalidQuery = {
        sortBy: "invalid-field",
        sortOrder: "invalid-order",
      };

      const result = productQuerySchema.safeParse(invalidQuery);
      expect(result.success).toBe(false);
    });
  });

  describe("productIdSchema", () => {
    it("should validate valid ID", () => {
      const validId = { id: "prod-123" };

      const result = productIdSchema.safeParse(validId);
      expect(result.success).toBe(true);
    });

    it("should reject missing ID", () => {
      const missingId = {};

      const result = productIdSchema.safeParse(missingId);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProductSchema", () => {
    it("should validate partial updates", () => {
      const partialUpdate = {
        id: "prod-123",
        name: "Updated Product Name",
        price: 39.99,
      };

      const result = updateProductSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it("should require ID field", () => {
      const updateWithoutId = {
        name: "Updated Product Name",
      };

      const result = updateProductSchema.safeParse(updateWithoutId);
      expect(result.success).toBe(false);
    });
  });
});
