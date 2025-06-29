import request from "supertest";
import { createApp } from "../../app";
import { Application } from "express";

describe("Product Controller", () => {
  let app: Application;

  beforeAll(async () => {
    app = createApp();
  });

  describe("Health Check Endpoints", () => {
    describe("GET /api/v1/health", () => {
      it("should return basic health status", async () => {
        const response = await request(app).get("/api/v1/health").expect(200);

        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty(
          "message",
          "Product service is healthy"
        );
        expect(response.body).toHaveProperty("timestamp");
        expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
      });
    });

    describe("GET /api/v1/health/detailed", () => {
      it("should return detailed health information", async () => {
        const response = await request(app)
          .get("/api/v1/health/detailed")
          .expect(200);

        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("service", "product-service");
        expect(response.body).toHaveProperty("version", "1.1.0");
        expect(response.body).toHaveProperty("status", "healthy");
        expect(response.body).toHaveProperty("timestamp");
        expect(response.body).toHaveProperty("uptime");
        expect(response.body).toHaveProperty("environment");

        // Check that all health checks are present
        expect(response.body).toHaveProperty("checks");
        expect(response.body.checks).toHaveProperty("database");
        expect(response.body.checks).toHaveProperty("memory");
        expect(response.body.checks).toHaveProperty("node");

        // Validate database check structure
        expect(response.body.checks.database).toHaveProperty("status");
        expect(response.body.checks.database).toHaveProperty("latency");
        expect(response.body.checks.database.latency).toMatch(/^\d+ms$/);

        // Validate memory check structure
        expect(response.body.checks.memory).toHaveProperty("used");
        expect(response.body.checks.memory).toHaveProperty("total");
        expect(response.body.checks.memory.used).toMatch(/^\d+MB$/);
        expect(response.body.checks.memory.total).toMatch(/^\d+MB$/);

        // Validate node check structure
        expect(response.body.checks.node).toHaveProperty("version");
        expect(response.body.checks.node).toHaveProperty("platform");
        expect(response.body.checks.node.version).toMatch(/^v\d+\.\d+\.\d+$/);
      });

      it("should return numeric uptime", async () => {
        const response = await request(app)
          .get("/api/v1/health/detailed")
          .expect(200);

        expect(typeof response.body.uptime).toBe("number");
        expect(response.body.uptime).toBeGreaterThan(0);
      });

      it("should have valid timestamp format", async () => {
        const response = await request(app)
          .get("/api/v1/health/detailed")
          .expect(200);

        const timestamp = new Date(response.body.timestamp);
        expect(timestamp).toBeInstanceOf(Date);
        expect(timestamp.getTime()).not.toBeNaN();
      });
    });
  });
});
