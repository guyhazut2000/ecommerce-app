import { PrismaClient } from "@prisma/client";
import DatabaseService from "../config/database";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilters,
  PaginationParams,
  PaginatedResponse,
  StockUpdateDto,
  ProductEntity,
} from "../types/product.types";
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateStockUpdate,
  convertToDecimal,
  ValidationError,
} from "../utils/validation";

export class ProductNotFoundError extends Error {
  constructor(identifier: string) {
    super(`Product not found: ${identifier}`);
    this.name = "ProductNotFoundError";
  }
}

export class DuplicateSKUError extends Error {
  constructor(sku: string) {
    super(`Product with SKU '${sku}' already exists`);
    this.name = "DuplicateSKUError";
  }
}

const prisma = DatabaseService.getInstance();

export const getAllProducts = async (
  filters: ProductFilters,
  pagination: PaginationParams
): Promise<PaginatedResponse<ProductEntity>> => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  // Build where clause for filtering
  const where: any = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.inStock !== undefined) {
    where.inStock = filters.inStock;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string): Promise<ProductEntity> => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new ProductNotFoundError(id);
  }

  return product;
};

export const getProductBySku = async (sku: string): Promise<ProductEntity> => {
  const product = await prisma.product.findUnique({
    where: { sku },
  });

  if (!product) {
    throw new ProductNotFoundError(`SKU: ${sku}`);
  }

  return product;
};

export const createProduct = async (
  data: CreateProductDto
): Promise<ProductEntity> => {
  validateCreateProduct(data);

  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: convertToDecimal(data.price),
        sku: data.sku,
        category: data.category,
        inStock: data.inStock ?? true,
        quantity: data.quantity ?? 0,
        imageUrl: data.imageUrl,
      },
    });

    return product;
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("sku")) {
      throw new DuplicateSKUError(data.sku);
    }
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  data: UpdateProductDto
): Promise<ProductEntity> => {
  validateUpdateProduct(data);

  // Check if product exists
  await getProductById(id);

  // Prepare update data
  const updateData: any = { ...data };

  if (data.price !== undefined) {
    updateData.price = convertToDecimal(data.price);
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return product;
  } catch (error: any) {
    if (error.code === "P2002" && error.meta?.target?.includes("sku")) {
      throw new DuplicateSKUError(data.sku!);
    }
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  // Check if product exists
  await getProductById(id);

  await prisma.product.delete({
    where: { id },
  });
};

export const updateStock = async (
  id: string,
  stockUpdate: StockUpdateDto
): Promise<ProductEntity> => {
  validateStockUpdate(stockUpdate);

  const existingProduct = await getProductById(id);

  let newQuantity: number;

  switch (stockUpdate.operation) {
    case "add":
      newQuantity = existingProduct.quantity + stockUpdate.quantity;
      break;
    case "subtract":
      newQuantity = existingProduct.quantity - stockUpdate.quantity;
      break;
    case "set":
    default:
      newQuantity = stockUpdate.quantity;
      break;
  }

  if (newQuantity < 0) {
    throw new ValidationError("Resulting quantity cannot be negative");
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      quantity: newQuantity,
      inStock: newQuantity > 0,
    },
  });

  return product;
};

export const getProductsByCategory = async (
  category: string
): Promise<ProductEntity[]> => {
  return prisma.product.findMany({
    where: {
      category,
      inStock: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getOutOfStockProducts = async (): Promise<ProductEntity[]> => {
  return prisma.product.findMany({
    where: {
      OR: [{ inStock: false }, { quantity: { lte: 0 } }],
    },
    orderBy: { updatedAt: "desc" },
  });
};

export const searchProducts = async (
  searchTerm: string
): Promise<ProductEntity[]> => {
  return prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
        { sku: { contains: searchTerm, mode: "insensitive" } },
        { category: { contains: searchTerm, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
};
