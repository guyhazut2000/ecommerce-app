import databaseService from "../config/database";
import type { Product } from "@prisma/client";
import type {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
  ProductResponse,
} from "../types/product.types";
import {
  toProductResponse,
  toProductResponseArray,
} from "../types/api-response.types";

// ===================================
// DATABASE CLIENT INSTANCE
// ===================================

const prisma = databaseService.getInstance().getPrismaClient();

// ===================================
// PRODUCT REPOSITORY - FUNCTIONAL MODULE
// ===================================

/**
 * Create a new product
 */
export const create = async (
  data: CreateProductInput
): Promise<ProductResponse> => {
  const product = await prisma.product.create({
    data,
  });
  return toProductResponse(product);
};

/**
 * Find product by ID
 */
export const findById = async (id: string): Promise<ProductResponse | null> => {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product ? toProductResponse(product) : null;
};

/**
 * Find all products with pagination and filtering
 */
export const findAll = async (
  query: ProductQueryParams
): Promise<{ products: ProductResponse[]; total: number }> => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = { inStock: true };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = minPrice;
    if (maxPrice) where.price.lte = maxPrice;
  }

  // Get total count
  const total = await prisma.product.count({ where });

  // Get products with pagination and sorting
  const products = await prisma.product.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
  });

  return {
    products: toProductResponseArray(products),
    total,
  };
};

/**
 * Update product by ID
 */
export const update = async (
  id: string,
  data: UpdateProductInput
): Promise<ProductResponse | null> => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    });
    return toProductResponse(product);
  } catch (error) {
    return null;
  }
};

/**
 * Soft delete product (set inStock to false)
 */
export const deleteProduct = async (
  id: string
): Promise<ProductResponse | null> => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { inStock: false },
    });
    return toProductResponse(product);
  } catch (error) {
    return null;
  }
};

/**
 * Hard delete product (permanent removal)
 */
export const hardDelete = async (
  id: string
): Promise<ProductResponse | null> => {
  try {
    const product = await prisma.product.delete({
      where: { id },
    });
    return toProductResponse(product);
  } catch (error) {
    return null;
  }
};

/**
 * Find products by category
 */
export const findByCategory = async (
  category: string
): Promise<ProductResponse[]> => {
  const products = await prisma.product.findMany({
    where: {
      category,
      inStock: true,
    },
  });
  return toProductResponseArray(products);
};

/**
 * Find product by SKU
 */
export const findBySku = async (
  sku: string
): Promise<ProductResponse | null> => {
  const product = await prisma.product.findUnique({
    where: { sku },
  });
  return product ? toProductResponse(product) : null;
};

/**
 * Update product stock quantity
 */
export const updateStock = async (
  id: string,
  quantity: number
): Promise<ProductResponse | null> => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        quantity: {
          decrement: quantity,
        },
        inStock: quantity > 0,
      },
    });
    return toProductResponse(product);
  } catch (error) {
    return null;
  }
};

/**
 * Check if enough stock is available
 */
export const checkStockAvailability = async (
  id: string,
  quantity: number
): Promise<boolean> => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { quantity: true },
  });
  return product ? product.quantity >= quantity : false;
};

/**
 * Get products with low stock (below threshold)
 */
export const findLowStock = async (
  threshold: number = 10
): Promise<ProductResponse[]> => {
  const products = await prisma.product.findMany({
    where: {
      quantity: { lte: threshold },
      inStock: true,
    },
    orderBy: { quantity: "asc" },
  });
  return toProductResponseArray(products);
};

/**
 * Search products by name or description
 */
export const search = async (
  searchTerm: string
): Promise<ProductResponse[]> => {
  const products = await prisma.product.findMany({
    where: {
      AND: [
        { inStock: true },
        {
          OR: [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { description: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
      ],
    },
  });
  return toProductResponseArray(products);
};

/**
 * Get raw Prisma product (for internal use)
 */
export const findRawById = async (id: string): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { id },
  });
};

/**
 * Bulk operations - find multiple products by IDs
 */
export const findByIds = async (ids: string[]): Promise<ProductResponse[]> => {
  const products = await prisma.product.findMany({
    where: {
      id: { in: ids },
      inStock: true,
    },
  });
  return toProductResponseArray(products);
};

/**
 * Count products by category
 */
export const countByCategory = async (category?: string): Promise<number> => {
  return prisma.product.count({
    where: category ? { category, inStock: true } : { inStock: true },
  });
};

// ===================================
// REPOSITORY MODULE EXPORT
// ===================================

/**
 * Product repository module - functional approach
 * Each function is independently testable and composable
 *
 * Note: Using 'delete' as deleteProduct to avoid reserved keyword conflict
 */
export const productRepository = {
  create,
  findById,
  findAll,
  update,
  delete: deleteProduct,
  hardDelete,
  findByCategory,
  findBySku,
  updateStock,
  checkStockAvailability,
  findLowStock,
  search,
  findRawById,
  findByIds,
  countByCategory,
} as const;
