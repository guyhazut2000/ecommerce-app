import express from "express";
import cors from "cors";
import helmet from "helmet";
import productRoutes from "./api/routes/product.routes";
import dotenv from "dotenv";
import {
  errorHandler,
  notFoundHandler,
} from "./api/middlewares/error-handler.middleware";
import databaseService from "./config/database";

// Load environment variables
dotenv.config();

export const createApp = (): express.Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "*",
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Request logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });

  // API routes
  app.use("/api/v1", productRoutes);

  // Root route for basic health check
  app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "Product Service API",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export const startServer = async (port: number): Promise<void> => {
  try {
    // Connect to database
    await databaseService.getInstance().connect();

    // Create Express app
    const app = createApp();

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Product service running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Setup graceful shutdown
    setupGracefulShutdown();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const setupGracefulShutdown = (): void => {
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    try {
      await databaseService.getInstance().disconnect();
      console.log("✅ Graceful shutdown completed");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};
