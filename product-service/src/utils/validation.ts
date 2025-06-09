import { Decimal } from "@prisma/client/runtime/library";
import {
  CreateProductDto,
  UpdateProductDto,
  StockUpdateDto,
} from "../types/product.types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validateCreateProduct = (data: CreateProductDto): void => {
  const { name, price, sku, category } = data;

  if (!name?.trim()) {
    throw new ValidationError("Product name is required");
  }

  if (!sku?.trim()) {
    throw new ValidationError("Product SKU is required");
  }

  if (!category?.trim()) {
    throw new ValidationError("Product category is required");
  }

  if (price === undefined || price === null) {
    throw new ValidationError("Product price is required");
  }

  if (price <= 0) {
    throw new ValidationError("Price must be greater than 0");
  }

  if (data.quantity !== undefined && data.quantity < 0) {
    throw new ValidationError("Quantity cannot be negative");
  }
};

export const validateUpdateProduct = (data: UpdateProductDto): void => {
  if (data.price !== undefined) {
    if (data.price <= 0) {
      throw new ValidationError("Price must be greater than 0");
    }
  }

  if (data.quantity !== undefined && data.quantity < 0) {
    throw new ValidationError("Quantity cannot be negative");
  }

  if (data.name !== undefined && !data.name.trim()) {
    throw new ValidationError("Product name cannot be empty");
  }

  if (data.sku !== undefined && !data.sku.trim()) {
    throw new ValidationError("Product SKU cannot be empty");
  }

  if (data.category !== undefined && !data.category.trim()) {
    throw new ValidationError("Product category cannot be empty");
  }
};

export const validateStockUpdate = (data: StockUpdateDto): void => {
  if (data.quantity === undefined || typeof data.quantity !== "number") {
    throw new ValidationError("Quantity must be a number");
  }

  if (data.operation && !["set", "add", "subtract"].includes(data.operation)) {
    throw new ValidationError("Operation must be 'set', 'add', or 'subtract'");
  }
};

export const validatePaginationParams = (
  page: string,
  limit: string
): { page: number; limit: number } => {
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError("Page must be a positive integer");
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError("Limit must be between 1 and 100");
  }

  return { page: pageNum, limit: limitNum };
};

export const convertToDecimal = (value: number): Decimal => {
  return new Decimal(value);
};
