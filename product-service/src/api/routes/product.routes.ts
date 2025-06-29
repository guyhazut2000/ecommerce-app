import { Router } from "express";
import { productController } from "../controllers/product.controller";

const router = Router();

// Health check endpoints
router.get("/health", productController.healthCheck);
router.get("/health/detailed", productController.detailedHealthCheck);

// Product routes
router.get("/products", productController.getAll);
router.get("/products/low-stock", productController.getLowStock);
router.get("/products/category/:category", productController.getByCategory);
router.get("/products/:id", productController.getById);

router.post("/products", productController.create);
router.put("/products/:id", productController.update);
router.patch("/products/:id/stock", productController.updateStock);
router.post("/products/:id/reserve", productController.reserveStock);
router.delete("/products/:id", productController.delete);

export default router;
