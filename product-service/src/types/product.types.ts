import type { Product, Prisma } from "@prisma/client";

// ===================================
// CORE PRISMA-BASED TYPES
// ===================================

/**
 * Main Product entity - directly from Prisma
 */
export type ProductEntity = Product;

/**
 * Product creation input - derived from Prisma
 * Omits auto-generated fields (id, createdAt, updatedAt)
 */
export type CreateProductInput = Omit<
  Prisma.ProductCreateInput,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Product update input - derived from Prisma
 * All fields optional except for identification
 */
export type UpdateProductInput = Prisma.ProductUpdateInput;

/**
 * Product where input for queries - from Prisma
 */
export type ProductWhereInput = Prisma.ProductWhereInput;

/**
 * Product order by input for sorting - from Prisma
 */
export type ProductOrderByInput = Prisma.ProductOrderByWithRelationInput;

/**
 * Product select input for partial queries - from Prisma
 */
export type ProductSelect = Prisma.ProductSelect;

// ===================================
// API-SPECIFIC DERIVED TYPES
// ===================================

/**
 * Product response for API - based on Prisma Product
 * Converts Decimal to number for JSON serialization
 */
export type ProductResponse = Omit<Product, "price"> & {
  price: number;
};

/**
 * Product creation DTO for API requests
 * Based on Prisma create input but with JSON-friendly types
 */
export type CreateProductDto = Omit<CreateProductInput, "price"> & {
  price: number;
};

/**
 * Product update DTO for API requests
 * Based on Prisma update input but with JSON-friendly types
 */
export type UpdateProductDto = {
  name?: string;
  description?: string | null;
  price?: number;
  sku?: string;
  category?: string;
  inStock?: boolean;
  quantity?: number;
  imageUrl?: string | null;
};

/**
 * Product ID parameter type
 */
export type ProductId = Pick<Product, "id">;

/**
 * Product SKU parameter type
 */
export type ProductSku = Pick<Product, "sku">;

// ===================================
// QUERY & FILTER TYPES
// ===================================

/**
 * Product filters for search and filtering
 */
export interface ProductFilters {
  category?: string;
  inStock?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Product query parameters with pagination and sorting
 */
export interface ProductQueryParams extends ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: keyof Product;
  sortOrder?: "asc" | "desc";
}

/**
 * Stock operation types
 */
export interface StockUpdateDto {
  quantity: number;
  operation?: "set" | "add" | "subtract";
}

/**
 * Stock reservation input
 */
export interface StockReservationInput {
  productId: string;
  quantity: number;
  reservationId?: string;
}

// ===================================
// PAGINATION TYPES
// ===================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ===================================
// UTILITY TYPES
// ===================================

/**
 * Partial Product for updates - ensures type safety
 */
export type PartialProduct = Partial<ProductEntity>;

/**
 * Product without timestamps - for creation
 */
export type ProductWithoutTimestamps = Omit<Product, "createdAt" | "updatedAt">;

/**
 * Product with only required fields
 */
export type ProductRequired = Pick<
  Product,
  "name" | "price" | "sku" | "category"
>;

/**
 * Product public fields (safe for API responses)
 */
export type ProductPublic = Omit<Product, never>; // All fields are public for now

/**
 * Product search result with relevance score
 */
export interface ProductSearchResult {
  product: ProductResponse;
  relevanceScore?: number;
}

// ===================================
// TYPE GUARDS
// ===================================

/**
 * Type guard to check if object is a valid Product
 */
export function isProduct(obj: any): obj is Product {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.sku === "string" &&
    typeof obj.category === "string" &&
    typeof obj.inStock === "boolean" &&
    typeof obj.quantity === "number"
  );
}

/**
 * Type guard to check if object is a valid CreateProductDto
 */
export function isCreateProductDto(obj: any): obj is CreateProductDto {
  return (
    obj &&
    typeof obj.name === "string" &&
    typeof obj.price === "number" &&
    typeof obj.sku === "string" &&
    typeof obj.category === "string"
  );
}

// ===================================
// EXPORT PRISMA TYPES FOR DIRECT USE
// ===================================

// Re-export commonly used Prisma types for convenience
export type { Prisma, PrismaClient } from "@prisma/client";

// Export specific Prisma input types that might be useful
export type PrismaProductCreateInput = Prisma.ProductCreateInput;
export type PrismaProductUpdateInput = Prisma.ProductUpdateInput;
export type PrismaProductWhereInput = Prisma.ProductWhereInput;
export type PrismaProductOrderByInput = Prisma.ProductOrderByWithRelationInput;
