import { productRepository } from "../repositories/product.repository";
import type {
  CreateProductInput,
  UpdateProductDto,
  ProductQueryParams,
  ProductResponse,
} from "../types/product.types";

// ===================================
// PRODUCT SERVICE - FUNCTIONAL MODULE
// ===================================

/**
 * Create a new product with business logic validation
 */
export const createProduct = async (
  data: CreateProductInput
): Promise<ProductResponse> => {
  // Business logic: Validate SKU uniqueness
  const existingProduct = await productRepository.findBySku(data.sku);
  if (existingProduct) {
    throw new Error(`Product with SKU ${data.sku} already exists`);
  }

  // Business logic: Set default quantity if not provided
  const productData = {
    ...data,
    quantity: data.quantity || 0,
    inStock: (data.quantity || 0) > 0,
  };

  return productRepository.create(productData);
};

/**
 * Get product by ID with existence validation
 */
export const getProductById = async (id: string): Promise<ProductResponse> => {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new Error(`Product with ID ${id} not found`);
  }
  return product;
};

/**
 * Get all products with pagination and business logic
 */
export const getAllProducts = async (
  query: ProductQueryParams
): Promise<{
  products: ProductResponse[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const result = await productRepository.findAll(query);
  const totalPages = Math.ceil(result.total / (query.limit || 10));

  return {
    ...result,
    page: query.page || 1,
    totalPages,
  };
};

/**
 * Update product with business validation
 */
export const updateProduct = async (
  id: string,
  data: UpdateProductDto
): Promise<ProductResponse> => {
  // Check if product exists
  const existingProduct = await productRepository.findById(id);
  if (!existingProduct) {
    throw new Error(`Product with ID ${id} not found`);
  }

  // Business logic: Check SKU uniqueness if SKU is being updated
  if (data.sku && data.sku !== existingProduct.sku) {
    const productWithSku = await productRepository.findBySku(data.sku);
    if (productWithSku) {
      throw new Error(`Product with SKU ${data.sku} already exists`);
    }
  }

  // Business logic: Update inStock based on quantity
  const updatedData = {
    ...data,
    inStock:
      typeof data.quantity === "number"
        ? data.quantity > 0
        : existingProduct.inStock,
  };

  const updatedProduct = await productRepository.update(id, updatedData);
  if (!updatedProduct) {
    throw new Error(`Failed to update product with ID ${id}`);
  }

  return updatedProduct;
};

/**
 * Delete product with existence validation
 */
export const deleteProduct = async (id: string): Promise<void> => {
  const product = await productRepository.findById(id);
  if (!product) {
    throw new Error(`Product with ID ${id} not found`);
  }

  await productRepository.delete(id);
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  category: string
): Promise<ProductResponse[]> => {
  return productRepository.findByCategory(category);
};

/**
 * Update product stock with business validation
 */
export const updateProductStock = async (
  id: string,
  quantity: number
): Promise<ProductResponse> => {
  if (quantity < 0) {
    throw new Error("Quantity cannot be negative");
  }

  const product = await productRepository.findById(id);
  if (!product) {
    throw new Error(`Product with ID ${id} not found`);
  }

  // Business logic: Update stock and inStock status
  const updatedProduct = await productRepository.update(id, {
    quantity,
    inStock: quantity > 0,
  });

  if (!updatedProduct) {
    throw new Error(`Failed to update stock for product with ID ${id}`);
  }

  return updatedProduct;
};

/**
 * Reserve product stock with availability check
 */
export const reserveProductStock = async (
  id: string,
  quantity: number
): Promise<boolean> => {
  const isAvailable = await productRepository.checkStockAvailability(
    id,
    quantity
  );
  if (!isAvailable) {
    return false;
  }

  await productRepository.updateStock(id, quantity);
  return true;
};

/**
 * Get products with low stock using repository method
 */
export const getLowStockProducts = async (
  threshold: number = 10
): Promise<ProductResponse[]> => {
  return productRepository.findLowStock(threshold);
};

// ===================================
// SERVICE MODULE EXPORT
// ===================================

/**
 * Product service module - functional approach
 * Each function is independently testable and composable
 */
export const productService = {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateProductStock,
  reserveProductStock,
  getLowStockProducts,
} as const;
