import { z } from "zod";

// ===================================
// PRISMA-ALIGNED ZOD SCHEMAS
// ===================================

/**
 * Base product schema that matches Prisma Product model
 * This ensures our validation aligns with the database schema
 */
export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().nullable().optional(),
  price: z.number().positive("Price must be positive"),
  sku: z.string().min(1, "SKU is required").max(100, "SKU too long"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category too long"),
  inStock: z.boolean().default(true),
  quantity: z.number().int().min(0, "Quantity cannot be negative").default(0),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

/**
 * Schema for creating a product - matches CreateProductDto
 * Omits auto-generated fields (id, createdAt, updatedAt)
 */
export const createProductSchema = productSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema for updating a product - matches UpdateProductDto
 * All fields optional except for validation rules
 */
export const updateProductSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .optional(),
  description: z.string().nullable().optional(),
  price: z.number().positive("Price must be positive").optional(),
  sku: z.string().min(1, "SKU is required").max(100, "SKU too long").optional(),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category too long")
    .optional(),
  inStock: z.boolean().optional(),
  quantity: z.number().int().min(0, "Quantity cannot be negative").optional(),
  imageUrl: z.string().url("Invalid image URL").nullable().optional(),
});

/**
 * Schema for product query parameters - matches ProductQueryParams
 */
export const productQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),

  // Filtering
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),

  // Sorting - using keyof Product for type safety
  sortBy: z
    .enum(["name", "price", "createdAt", "updatedAt", "category", "quantity"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for product ID parameter
 */
export const productIdSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

/**
 * Schema for product SKU parameter
 */
export const productSkuSchema = z.object({
  sku: z.string().min(1, "Product SKU is required"),
});

/**
 * Schema for stock update operations
 */
export const stockUpdateSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
  operation: z.enum(["set", "add", "subtract"]).default("set"),
});

/**
 * Schema for stock reservation
 */
export const stockReservationSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  reservationId: z.string().optional(),
});

/**
 * Schema for bulk product operations
 */
export const bulkProductIdsSchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),
});

/**
 * Schema for product filters only (without pagination)
 */
export const productFiltersSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.boolean().optional(),
});

// ===================================
// TYPE INFERENCE FROM ZOD SCHEMAS
// ===================================

/**
 * Inferred types from Zod schemas
 * These should match the types from product.types.ts
 */
export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
export type ProductId = z.infer<typeof productIdSchema>;
export type ProductSku = z.infer<typeof productSkuSchema>;
export type StockUpdate = z.infer<typeof stockUpdateSchema>;
export type StockReservation = z.infer<typeof stockReservationSchema>;
export type BulkProductIds = z.infer<typeof bulkProductIdsSchema>;
export type ProductFilters = z.infer<typeof productFiltersSchema>;

// ===================================
// VALIDATION HELPER FUNCTIONS
// ===================================

/**
 * Validate and transform product data for creation
 */
export const validateCreateProduct = (data: unknown): CreateProductInput => {
  return createProductSchema.parse(data);
};

/**
 * Validate and transform product data for update
 */
export const validateUpdateProduct = (data: unknown): UpdateProductInput => {
  return updateProductSchema.parse(data);
};

/**
 * Validate query parameters
 */
export const validateProductQuery = (data: unknown): ProductQuery => {
  return productQuerySchema.parse(data);
};

/**
 * Validate product ID parameter
 */
export const validateProductId = (data: unknown): ProductId => {
  return productIdSchema.parse(data);
};

/**
 * Validate stock update data
 */
export const validateStockUpdate = (data: unknown): StockUpdate => {
  return stockUpdateSchema.parse(data);
};

// ===================================
// CUSTOM VALIDATION RULES
// ===================================

/**
 * Custom validation for price range
 */
export const validatePriceRange = (
  minPrice?: number,
  maxPrice?: number
): boolean => {
  if (minPrice && maxPrice && minPrice > maxPrice) {
    throw new Error("Minimum price cannot be greater than maximum price");
  }
  return true;
};

/**
 * Custom validation for SKU format
 * You can customize this based on your business rules
 */
export const validateSkuFormat = (sku: string): boolean => {
  const skuPattern = /^[A-Z0-9-]+$/; // Example: Only uppercase letters, numbers, and hyphens
  return skuPattern.test(sku);
};

/**
 * Custom validation for category
 * You can add your business-specific category validation here
 */
export const validateCategory = (category: string): boolean => {
  const allowedCategories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Toys",
    "Health & Beauty",
    "Automotive",
    "Food & Beverages",
    "Other",
  ];
  return allowedCategories.includes(category);
};

// ===================================
// SCHEMA COMPOSITION HELPERS
// ===================================

/**
 * Create a schema for partial product updates
 */
export const createPartialUpdateSchema = (
  fields: (keyof z.infer<typeof productSchema>)[]
) => {
  const baseSchema = updateProductSchema.omit({ id: true });
  const pickObject = fields.reduce(
    (acc, field) => ({ ...acc, [field]: true }),
    {} as any
  );
  return baseSchema.pick(pickObject);
};

/**
 * Create a schema for product selection (pick specific fields)
 */
export const createProductSelectSchema = (
  fields: (keyof z.infer<typeof productSchema>)[]
) => {
  const pickObject = fields.reduce(
    (acc, field) => ({ ...acc, [field]: true }),
    {} as any
  );
  return productSchema.pick(pickObject);
};
