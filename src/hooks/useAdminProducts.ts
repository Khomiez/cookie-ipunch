// src/hooks/useAdminProducts.ts
import { useState, useEffect, useCallback } from "react";
import { IProduct } from "@/interfaces/product";

interface ProductsResponse {
  products: IProduct[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseAdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive";
  category?: string;
}

interface UseAdminProductsReturn {
  products: IProduct[];
  pagination: ProductsResponse["pagination"] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProduct: (data: Partial<IProduct>) => Promise<IProduct>;
  updateProduct: (id: string, data: Partial<IProduct>) => Promise<IProduct>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string, currentStatus: boolean) => Promise<void>;
  bulkOperation: (
    action: string,
    productIds: string[],
    data?: any
  ) => Promise<void>;
  syncWithStripe: () => Promise<void>;
}

export const useAdminProducts = (
  params: UseAdminProductsParams = {}
): UseAdminProductsReturn => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [pagination, setPagination] = useState<
    ProductsResponse["pagination"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    page = 1,
    limit = 20,
    search = "",
    status = "all",
    category = "",
  } = params;

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(status !== "all" && { status }),
        ...(category && { category }),
      });

      const response = await fetch(`/api/admin/products?${searchParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch products");
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, category]);

  // Create product
  const createProduct = useCallback(
    async (productData: Partial<IProduct>): Promise<IProduct> => {
      try {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create product");
        }

        const data = await response.json();
        await fetchProducts(); // Refresh the list
        return data.product;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create product";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchProducts]
  );

  // Update product
  const updateProduct = useCallback(
    async (productId: string, productData: Partial<IProduct>): Promise<IProduct> => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update product");
        }

        const data = await response.json();
        await fetchProducts(); // Refresh the list
        return data.product;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update product";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchProducts]
  );

  // Delete product
  const deleteProduct = useCallback(
    async (productId: string): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete product");
        }

        await fetchProducts(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete product";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchProducts]
  );

  // Toggle product status
  const toggleProductStatus = useCallback(
    async (productId: string, currentStatus: boolean): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !currentStatus }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to toggle product status");
        }

        await fetchProducts(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to toggle product status";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchProducts]
  );

  // Bulk operations
  const bulkOperation = useCallback(
    async (action: string, productIds: string[], data?: any): Promise<void> => {
      try {
        const response = await fetch("/api/admin/products/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, productIds, data }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to perform bulk operation"
          );
        }

        await fetchProducts(); // Refresh the list
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Failed to perform bulk operation";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchProducts]
  );

  // Sync with Stripe
  const syncWithStripe = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/products/bulk", {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sync with Stripe");
      }

      await fetchProducts(); // Refresh the list
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sync with Stripe";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    bulkOperation,
    syncWithStripe,
  };
};

// Additional hook for single product operations
export const useAdminProduct = (productId: string | null) => {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/products/${productId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch product");
      }

      const data = await response.json();
      setProduct(data.product);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch product");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
};
