import type { Product } from "@prisma/client";

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  sku: string;
  category: string;
  inStock?: boolean;
  quantity?: number;
  imageUrl?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  category?: string;
  inStock?: boolean;
  quantity?: number;
  imageUrl?: string;
}

export interface ProductFilters {
  category?: string;
  inStock?: boolean;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StockUpdateDto {
  quantity: number;
  operation?: "set" | "add" | "subtract";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export type ProductEntity = Product;
