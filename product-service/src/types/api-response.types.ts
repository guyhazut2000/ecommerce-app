import type { Product } from "@prisma/client";

import type { PaginationMeta, ProductResponse } from "./product.types";

// ===================================
// BASE API RESPONSE TYPES
// ===================================

/**
 * Base API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: PaginationMeta;
  timestamp?: string;
}

/**
 * Validation error structure
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Error response types
 */
export interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  stack?: string; // Only in development
}

/**
 * Success response types
 */
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationMeta;
}

// ===================================
// PRODUCT-SPECIFIC RESPONSE TYPES
// ===================================

/**
 * Single product response - uses Prisma-based ProductResponse
 */
export interface ProductApiResponse extends SuccessResponse<ProductResponse> {
  data: ProductResponse;
}

/**
 * Multiple products response with pagination
 */
export interface ProductListResponse
  extends SuccessResponse<ProductResponse[]> {
  data: ProductResponse[];
  pagination: PaginationMeta;
}

/**
 * Product creation response
 */
export interface ProductCreateResponse
  extends SuccessResponse<ProductResponse> {
  data: ProductResponse;
  message: "Product created successfully";
}

/**
 * Product update response
 */
export interface ProductUpdateResponse
  extends SuccessResponse<ProductResponse> {
  data: ProductResponse;
  message: "Product updated successfully";
}

/**
 * Product deletion response
 */
export interface ProductDeleteResponse extends SuccessResponse<never> {
  message: "Product deleted successfully";
}

// ===================================
// STOCK OPERATION RESPONSES
// ===================================

/**
 * Stock update response
 */
export interface StockUpdateResponse extends SuccessResponse<ProductResponse> {
  data: ProductResponse;
  message: "Stock updated successfully";
}

/**
 * Stock reservation response
 */
export interface StockReservationResponse {
  success: boolean;
  message: string;
  reservationId?: string;
}

// ===================================
// HEALTH CHECK RESPONSE
// ===================================

/**
 * Health check response
 */
export interface HealthCheckResponse {
  success: true;
  message: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

// ===================================
// HELPER FUNCTIONS FOR RESPONSE CREATION
// ===================================

/**
 * Create a success response with Prisma Product data
 */
export const createSuccessResponse = <T>(
  data: T,
  message?: string,
  pagination?: PaginationMeta
): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  pagination,
});

/**
 * Create an error response
 */
export const createErrorResponse = (
  message: string,
  errors?: ValidationError[]
): ErrorResponse => ({
  success: false,
  message,
  errors,
});

/**
 * Create pagination metadata
 */
export const createPaginationInfo = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

/**
 * Convert Prisma Product to API-friendly ProductResponse
 * Handles Decimal to number conversion for JSON serialization
 */
export const toProductResponse = (product: Product): ProductResponse => ({
  ...product,
  price: Number(product.price), // Convert Prisma Decimal to number
});

/**
 * Convert array of Prisma Products to ProductResponse array
 */
export const toProductResponseArray = (
  products: Product[]
): ProductResponse[] => products.map(toProductResponse);

/**
 * Create a product list response with pagination
 */
export const createProductListResponse = (
  products: Product[],
  pagination: PaginationMeta
): ProductListResponse => ({
  success: true,
  data: toProductResponseArray(products),
  pagination,
});

/**
 * Create a single product response
 */
export const createProductResponse = (
  product: Product,
  message?: string
): ProductApiResponse => ({
  success: true,
  data: toProductResponse(product),
  message,
});

// ===================================
// TYPE GUARDS FOR API RESPONSES
// ===================================

/**
 * Type guard to check if response is a success response
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard to check if response is an error response
 */
export function isErrorResponse(
  response: ApiResponse<any>
): response is ErrorResponse {
  return response.success === false;
}

// ===================================
// LEGACY COMPATIBILITY
// ===================================

/**
 * @deprecated Use PaginationMeta instead
 * Legacy pagination info for backward compatibility
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
