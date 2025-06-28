import { useQuery } from "@tanstack/react-query";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Get product service URL from environment variables
    const productServiceUrl =
      process.env.NEXT_PUBLIC_PRODUCT_SERVICE_API_URL ||
      "http://localhost:4001";
    const response = await fetch(`${productServiceUrl}/api/v1/products`);
    console.log(response);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Failed to fetch products: ${response.status} ${errorData}`
      );
    }

    const data = await response.json();

    // Handle both direct array response and wrapped response
    return Array.isArray(data) ? data : data.data || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
};
