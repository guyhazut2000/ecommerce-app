import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { validatePaginationParams } from "../utils/validation";
import { ApiResponse } from "../types/product.types";

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category, inStock, search, page = "1", limit = "10" } = req.query;

  const pagination = validatePaginationParams(page as string, limit as string);

  const filters = {
    category: category as string,
    inStock:
      inStock === "true" ? true : inStock === "false" ? false : undefined,
    search: search as string,
  };

  const result = await productService.getAllProducts(filters, pagination);

  const response: ApiResponse = {
    success: true,
    data: result.data,
    pagination: result.pagination,
  };

  res.json(response);
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const product = await productService.getProductById(id);

  const response: ApiResponse = {
    success: true,
    data: product,
  };

  res.json(response);
};

export const getProductBySku = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { sku } = req.params;

  const product = await productService.getProductBySku(sku);

  const response: ApiResponse = {
    success: true,
    data: product,
  };

  res.json(response);
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productData = req.body;

  const product = await productService.createProduct(productData);

  const response: ApiResponse = {
    success: true,
    data: product,
    message: "Product created successfully",
  };

  res.status(201).json(response);
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await productService.updateProduct(id, updateData);

  const response: ApiResponse = {
    success: true,
    data: product,
    message: "Product updated successfully",
  };

  res.json(response);
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  await productService.deleteProduct(id);

  const response: ApiResponse = {
    success: true,
    message: "Product deleted successfully",
  };

  res.status(204).json(response);
};

export const updateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const stockUpdate = req.body;

  const product = await productService.updateStock(id, stockUpdate);

  const response: ApiResponse = {
    success: true,
    data: product,
    message: "Stock updated successfully",
  };

  res.json(response);
};

export const getProductsByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category } = req.params;

  const products = await productService.getProductsByCategory(category);

  const response: ApiResponse = {
    success: true,
    data: products,
  };

  res.json(response);
};

export const getOutOfStockProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const products = await productService.getOutOfStockProducts();

  const response: ApiResponse = {
    success: true,
    data: products,
  };

  res.json(response);
};

export const searchProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    const response: ApiResponse = {
      success: false,
      error: "Search query parameter 'q' is required",
    };
    res.status(400).json(response);
    return;
  }

  const products = await productService.searchProducts(q);

  const response: ApiResponse = {
    success: true,
    data: products,
  };

  res.json(response);
};

export const healthCheck = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: true,
    message: "Product service is running",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    },
  };

  res.json(response);
};
