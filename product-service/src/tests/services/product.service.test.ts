import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getProductsByCategory,
  getLowStockProducts,
  reserveProductStock,
} from "../../services/product.service";

// Mock the repository module
jest.mock("../../repositories/product.repository", () => ({
  productRepository: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findBySku: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCategory: jest.fn(),
    findLowStock: jest.fn(),
    updateStock: jest.fn(),
    checkStockAvailability: jest.fn(),
  },
}));

import { productRepository } from "../../repositories/product.repository";

const mockProductRepository = productRepository as jest.Mocked<
  typeof productRepository
>;

describe("Product Service - Functional Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockProduct = {
    id: "1",
    name: "Test Product",
    description: "Test Description",
    price: 29.99,
    sku: "TEST-001",
    category: "Electronics",
    inStock: true,
    quantity: 10,
    imageUrl: "https://example.com/image.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("getAllProducts", () => {
    it("should return paginated products with total pages calculation", async () => {
      const query = { page: 1, limit: 10 };
      const mockResult = {
        products: [mockProduct],
        total: 25,
      };

      mockProductRepository.findAll.mockResolvedValue(mockResult);

      const result = await getAllProducts(query);

      expect(mockProductRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        products: [mockProduct],
        total: 25,
        page: 1,
        totalPages: 3, // Math.ceil(25/10)
      });
    });

    it("should handle default values for page and limit", async () => {
      const query = {};
      const mockResult = {
        products: [mockProduct],
        total: 5,
      };

      mockProductRepository.findAll.mockResolvedValue(mockResult);

      const result = await getAllProducts(query);

      expect(result.page).toBe(1); // Default page
      expect(result.totalPages).toBe(1); // Math.ceil(5/10)
    });
  });

  describe("getProductById", () => {
    it("should return product when found", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await getProductById("1");

      expect(mockProductRepository.findById).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockProduct);
    });

    it("should throw error when product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(getProductById("999")).rejects.toThrow(
        "Product with ID 999 not found"
      );
    });
  });

  describe("createProduct", () => {
    const createData = {
      name: "New Product",
      description: "New Description",
      price: 39.99,
      sku: "NEW-001",
      category: "Electronics",
      quantity: 5,
    };

    it("should create product when SKU is unique", async () => {
      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(mockProduct);

      const result = await createProduct(createData);

      expect(mockProductRepository.findBySku).toHaveBeenCalledWith("NEW-001");
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        ...createData,
        quantity: 5,
        inStock: true,
      });
      expect(result).toEqual(mockProduct);
    });

    it("should throw error when SKU already exists", async () => {
      mockProductRepository.findBySku.mockResolvedValue(mockProduct);

      await expect(createProduct(createData)).rejects.toThrow(
        "Product with SKU NEW-001 already exists"
      );
    });

    it("should set default quantity and inStock correctly", async () => {
      const dataWithoutQuantity: any = { ...createData };
      delete dataWithoutQuantity.quantity;

      mockProductRepository.findBySku.mockResolvedValue(null);
      mockProductRepository.create.mockResolvedValue(mockProduct);

      await createProduct(dataWithoutQuantity);

      expect(mockProductRepository.create).toHaveBeenCalledWith({
        ...dataWithoutQuantity,
        quantity: 0,
        inStock: false,
      });
    });
  });

  describe("updateProduct", () => {
    const updateData = {
      name: "Updated Product",
      price: 49.99,
    };

    it("should update product when it exists", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        ...updateData,
      });

      const result = await updateProduct("1", updateData);

      expect(mockProductRepository.findById).toHaveBeenCalledWith("1");
      expect(mockProductRepository.update).toHaveBeenCalledWith("1", {
        ...updateData,
        inStock: mockProduct.inStock,
      });
      expect(result).toEqual({ ...mockProduct, ...updateData });
    });

    it("should throw error when product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(updateProduct("999", updateData)).rejects.toThrow(
        "Product with ID 999 not found"
      );
    });

    it("should validate SKU uniqueness when updating SKU", async () => {
      const updateWithSku = { ...updateData, sku: "NEW-SKU" };
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.findBySku.mockResolvedValue({
        ...mockProduct,
        id: "2",
      });

      await expect(updateProduct("1", updateWithSku)).rejects.toThrow(
        "Product with SKU NEW-SKU already exists"
      );
    });

    it("should handle quantity updates correctly", async () => {
      const updateWithQuantity = { quantity: 15 };
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.update.mockResolvedValue({
        ...mockProduct,
        quantity: 15,
      });

      await updateProduct("1", updateWithQuantity);

      expect(mockProductRepository.update).toHaveBeenCalledWith("1", {
        quantity: 15,
        inStock: true,
      });
    });
  });

  describe("deleteProduct", () => {
    it("should delete product when it exists", async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue(mockProduct);

      await deleteProduct("1");

      expect(mockProductRepository.findById).toHaveBeenCalledWith("1");
      expect(mockProductRepository.delete).toHaveBeenCalledWith("1");
    });

    it("should throw error when product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(deleteProduct("999")).rejects.toThrow(
        "Product with ID 999 not found"
      );
    });
  });

  describe("getProductsByCategory", () => {
    it("should return products for given category", async () => {
      const categoryProducts = [mockProduct];
      mockProductRepository.findByCategory.mockResolvedValue(categoryProducts);

      const result = await getProductsByCategory("Electronics");

      expect(mockProductRepository.findByCategory).toHaveBeenCalledWith(
        "Electronics"
      );
      expect(result).toEqual(categoryProducts);
    });
  });

  describe("updateProductStock", () => {
    it("should update stock when product exists and quantity is valid", async () => {
      const updatedProduct = { ...mockProduct, quantity: 15, inStock: true };
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await updateProductStock("1", 15);

      expect(mockProductRepository.findById).toHaveBeenCalledWith("1");
      expect(mockProductRepository.update).toHaveBeenCalledWith("1", {
        quantity: 15,
        inStock: true,
      });
      expect(result).toEqual(updatedProduct);
    });

    it("should throw error for negative quantity", async () => {
      await expect(updateProductStock("1", -5)).rejects.toThrow(
        "Quantity cannot be negative"
      );
    });

    it("should throw error when product not found", async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(updateProductStock("999", 10)).rejects.toThrow(
        "Product with ID 999 not found"
      );
    });

    it("should set inStock to false when quantity is 0", async () => {
      const updatedProduct = { ...mockProduct, quantity: 0, inStock: false };
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      await updateProductStock("1", 0);

      expect(mockProductRepository.update).toHaveBeenCalledWith("1", {
        quantity: 0,
        inStock: false,
      });
    });
  });

  describe("reserveProductStock", () => {
    it("should reserve stock when available", async () => {
      mockProductRepository.checkStockAvailability.mockResolvedValue(true);
      mockProductRepository.updateStock.mockResolvedValue(mockProduct);

      const result = await reserveProductStock("1", 5);

      expect(mockProductRepository.checkStockAvailability).toHaveBeenCalledWith(
        "1",
        5
      );
      expect(mockProductRepository.updateStock).toHaveBeenCalledWith("1", 5);
      expect(result).toBe(true);
    });

    it("should return false when stock is insufficient", async () => {
      mockProductRepository.checkStockAvailability.mockResolvedValue(false);

      const result = await reserveProductStock("1", 15);

      expect(mockProductRepository.checkStockAvailability).toHaveBeenCalledWith(
        "1",
        15
      );
      expect(mockProductRepository.updateStock).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe("getLowStockProducts", () => {
    it("should return low stock products with default threshold", async () => {
      const lowStockProducts = [{ ...mockProduct, quantity: 5 }];
      mockProductRepository.findLowStock.mockResolvedValue(lowStockProducts);

      const result = await getLowStockProducts();

      expect(mockProductRepository.findLowStock).toHaveBeenCalledWith(10);
      expect(result).toEqual(lowStockProducts);
    });

    it("should use custom threshold", async () => {
      const lowStockProducts = [{ ...mockProduct, quantity: 3 }];
      mockProductRepository.findLowStock.mockResolvedValue(lowStockProducts);

      const result = await getLowStockProducts(5);

      expect(mockProductRepository.findLowStock).toHaveBeenCalledWith(5);
      expect(result).toEqual(lowStockProducts);
    });
  });
});
