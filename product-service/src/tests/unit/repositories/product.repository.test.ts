const mockPrismaClient = {
  product: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

// Mock the database service
jest.mock("../../../config/database", () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getPrismaClient: () => mockPrismaClient,
    }),
  },
}));

import {
  checkStockAvailability,
  create,
  deleteProduct,
  findAll,
  findById,
  findBySku,
  productRepository,
  update,
} from "../../../repositories/product.repository";

// Mock the response helper functions
jest.mock("../../../types/api-response.types", () => ({
  toProductResponse: jest.fn((product) => ({
    ...product,
    price: Number(product.price),
  })),
  toProductResponseArray: jest.fn((products) =>
    products.map((product: any) => ({
      ...product,
      price: Number(product.price),
    }))
  ),
}));

describe("Product Repository - Functional Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProductData = {
    name: "Test Product",
    description: "Test Description",
    price: 29.99,
    sku: "TEST-001",
    category: "Electronics",
    inStock: true,
    quantity: 10,
    imageUrl: "https://example.com/image.jpg",
  };

  const mockProduct = {
    id: "1",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...mockProductData,
  };

  describe("create", () => {
    it("should create a new product", async () => {
      mockPrismaClient.product.create.mockResolvedValue(mockProduct);

      const result = await create(mockProductData);

      expect(mockPrismaClient.product.create).toHaveBeenCalledWith({
        data: mockProductData,
      });
      expect(result).toEqual({
        ...mockProduct,
        price: Number(mockProduct.price),
      });
    });
  });

  describe("findById", () => {
    it("should return product when found", async () => {
      const expectedProduct = {
        id: "1",
        name: "Test Product",
        price: 29.99,
        sku: "TEST-001",
        category: "Electronics",
        inStock: true,
        quantity: 10,
      };

      mockPrismaClient.product.findUnique.mockResolvedValue(expectedProduct);

      const result = await findById("1");

      expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
      });
      expect(result).toEqual({
        ...expectedProduct,
        price: Number(expectedProduct.price),
      });
    });

    it("should return null when product not found", async () => {
      mockPrismaClient.product.findUnique.mockResolvedValue(null);

      const result = await findById("999");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return paginated products", async () => {
      const mockProducts = [
        { id: "1", name: "Product 1", price: 10.0 },
        { id: "2", name: "Product 2", price: 20.0 },
      ];

      const query = {
        page: 1,
        limit: 10,
        category: "Electronics",
        search: "test",
        sortBy: "name" as const,
        sortOrder: "asc" as const,
      };

      mockPrismaClient.product.count.mockResolvedValue(25);
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

      const result = await findAll(query);

      expect(mockPrismaClient.product.count).toHaveBeenCalledWith({
        where: {
          inStock: true,
          category: "Electronics",
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { description: { contains: "test", mode: "insensitive" } },
          ],
        },
      });

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
        where: {
          inStock: true,
          category: "Electronics",
          OR: [
            { name: { contains: "test", mode: "insensitive" } },
            { description: { contains: "test", mode: "insensitive" } },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: { name: "asc" },
      });

      expect(result).toEqual({
        products: mockProducts.map((p) => ({ ...p, price: Number(p.price) })),
        total: 25,
      });
    });

    it("should handle price range filters", async () => {
      const mockProducts = [{ id: "1", name: "Product 1" }];
      const query = {
        page: 1,
        limit: 10,
        minPrice: 10,
        maxPrice: 50,
      };

      mockPrismaClient.product.count.mockResolvedValue(1);
      mockPrismaClient.product.findMany.mockResolvedValue(mockProducts);

      await findAll(query);

      expect(mockPrismaClient.product.findMany).toHaveBeenCalledWith({
        where: {
          inStock: true,
          price: {
            gte: 10,
            lte: 50,
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("update", () => {
    it("should update product successfully", async () => {
      const updateData = { name: "Updated Product", price: 39.99 };
      const updatedProduct = { ...mockProduct, ...updateData };

      mockPrismaClient.product.update.mockResolvedValue(updatedProduct);

      const result = await update("1", updateData);

      expect(mockPrismaClient.product.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: updateData,
      });
      expect(result).toEqual({
        ...updatedProduct,
        price: Number(updatedProduct.price),
      });
    });

    it("should return null on update error", async () => {
      mockPrismaClient.product.update.mockRejectedValue(
        new Error("Update failed")
      );

      const result = await update("1", { name: "Updated" });

      expect(result).toBeNull();
    });
  });

  describe("deleteProduct", () => {
    it("should soft delete product", async () => {
      const deletedProduct = { ...mockProduct, inStock: false };

      mockPrismaClient.product.update.mockResolvedValue(deletedProduct);

      const result = await deleteProduct("1");

      expect(mockPrismaClient.product.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { inStock: false },
      });
      expect(result).toEqual({
        ...deletedProduct,
        price: Number(deletedProduct.price),
      });
    });
  });

  describe("findBySku", () => {
    it("should return product when found by SKU", async () => {
      const expectedProduct = {
        id: "1",
        sku: "TEST-001",
        name: "Test Product",
      };

      mockPrismaClient.product.findUnique.mockResolvedValue(expectedProduct);

      const result = await findBySku("TEST-001");

      expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith({
        where: { sku: "TEST-001" },
      });
      expect(result).toBeDefined();
    });
  });

  describe("checkStockAvailability", () => {
    it("should return true when enough stock is available", async () => {
      const product = { id: "1", quantity: 15 };

      mockPrismaClient.product.findUnique.mockResolvedValue(product);

      const result = await checkStockAvailability("1", 10);

      expect(mockPrismaClient.product.findUnique).toHaveBeenCalledWith({
        where: { id: "1" },
        select: { quantity: true },
      });
      expect(result).toBe(true);
    });

    it("should return false when insufficient stock", async () => {
      const product = { id: "1", quantity: 5 };

      mockPrismaClient.product.findUnique.mockResolvedValue(product);

      const result = await checkStockAvailability("1", 10);

      expect(result).toBe(false);
    });

    it("should return false when product not found", async () => {
      mockPrismaClient.product.findUnique.mockResolvedValue(null);

      const result = await checkStockAvailability("999", 10);

      expect(result).toBe(false);
    });
  });

  describe("productRepository module", () => {
    it("should export all repository functions", () => {
      expect(productRepository).toBeDefined();
      expect(productRepository.create).toBeDefined();
      expect(productRepository.findById).toBeDefined();
      expect(productRepository.findAll).toBeDefined();
      expect(productRepository.update).toBeDefined();
      expect(productRepository.delete).toBeDefined();
      expect(productRepository.findBySku).toBeDefined();
      expect(productRepository.checkStockAvailability).toBeDefined();
    });

    it("should have consistent function signatures", () => {
      expect(typeof productRepository.create).toBe("function");
      expect(typeof productRepository.findById).toBe("function");
      expect(typeof productRepository.findAll).toBe("function");
      expect(typeof productRepository.update).toBe("function");
      expect(typeof productRepository.delete).toBe("function");
    });
  });
});
