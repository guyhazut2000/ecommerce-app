import { Request, Response } from "express";
import { productService } from "../../services/product.service";
import { asyncHandler } from "../middlewares/error-handler.middleware";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
  productIdSchema,
} from "../validators/product.validators";

export const productController = {
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const query = productQuerySchema.parse(req.query);
    const result = await productService.getAllProducts(query);

    res.json({
      success: true,
      data: result.products,
      pagination: {
        page: result.page,
        limit: query.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdSchema.parse(req.params);
    const product = await productService.getProductById(id);

    res.json({
      success: true,
      data: product,
    });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const productData = createProductSchema.parse(req.body);
    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdSchema.parse(req.params);
    const updateData = updateProductSchema.parse({ ...req.body, id });
    const product = await productService.updateProduct(id, updateData);

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdSchema.parse(req.params);
    await productService.deleteProduct(id);

    res.status(204).json({
      success: true,
      message: "Product deleted successfully",
    });
  }),

  updateStock: asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdSchema.parse(req.params);
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 0) {
      throw new Error("Quantity must be a non-negative number");
    }

    const product = await productService.updateProductStock(id, quantity);

    res.json({
      success: true,
      data: product,
      message: "Stock updated successfully",
    });
  }),

  getByCategory: asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const products = await productService.getProductsByCategory(category);

    res.json({
      success: true,
      data: products,
    });
  }),

  getLowStock: asyncHandler(async (req: Request, res: Response) => {
    const threshold = req.query.threshold
      ? parseInt(req.query.threshold as string)
      : 10;
    const products = await productService.getLowStockProducts(threshold);

    res.json({
      success: true,
      data: products,
    });
  }),

  reserveStock: asyncHandler(async (req: Request, res: Response) => {
    const { id } = productIdSchema.parse(req.params);
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity <= 0) {
      throw new Error("Quantity must be a positive number");
    }

    const success = await productService.reserveProductStock(id, quantity);

    if (!success) {
      res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
      return;
    }

    res.json({
      success: true,
      message: "Stock reserved successfully",
    });
  }),

  healthCheck: (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Product service is healthy",
      timestamp: new Date().toISOString(),
    });
  },
};
