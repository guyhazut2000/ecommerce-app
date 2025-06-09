import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Health check
router.get("/", productController.healthCheck);

// Product routes
router.get("/products", asyncHandler(productController.getAllProducts));
router.post("/products", asyncHandler(productController.createProduct));

// Important: Place specific routes before parameterized routes
router.get("/products/search", asyncHandler(productController.searchProducts));
router.get(
  "/products/out-of-stock",
  asyncHandler(productController.getOutOfStockProducts)
);
router.get(
  "/products/sku/:sku",
  asyncHandler(productController.getProductBySku)
);
router.get(
  "/products/category/:category",
  asyncHandler(productController.getProductsByCategory)
);

// Parameterized routes (should come after specific routes)
router.get("/products/:id", asyncHandler(productController.getProductById));
router.put("/products/:id", asyncHandler(productController.updateProduct));
router.patch("/products/:id", asyncHandler(productController.updateProduct));
router.delete("/products/:id", asyncHandler(productController.deleteProduct));

// Stock management
router.post("/products/:id/stock", asyncHandler(productController.updateStock));

export default router;
