import { apiClient } from "@/utils/apiClient";
import { useCallback, useState } from "react";

export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string | null;
  imageUrl: string;
  isActive: boolean;
  restaurantId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    icon: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  liked?: boolean;
  description?: string;
}

export interface ProductsResponse {
  data: ApiProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

interface UseProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export const useProducts = (initialLimit: number = 10) => {
  const [state, setState] = useState<UseProductsState>({
    products: [],
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 0,
    totalPages: 0,
  });

  const fetchProducts = useCallback(
    async (
      page: number = 1,
      limit: number = initialLimit,
      reset: boolean = false,
    ) => {
      try {
        setState((prev) => ({
          ...prev,
          loading: true,
          error: null,
        }));

        const response = await apiClient.get<ProductsResponse>("/products", {
          params: {
            page,
            limit,
          },
        });

        const { data, meta } = response.data;

        // Transform API products to our Product interface
        const productsWithLiked: Product[] = data.map((apiProduct) => {
          // Generate a fallback image if the API image URL is a placeholder
          const fallbackImage = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsBGOs2225fFqTfnl5EKlrEUBn5-drby1x3Q&s`;
          const imageUrl =
            apiProduct.imageUrl && !apiProduct.imageUrl.includes("example.com")
              ? apiProduct.imageUrl
              : fallbackImage;

          return {
            id: apiProduct.id,
            name: apiProduct.name,
            price: parseFloat(apiProduct.price),
            image: imageUrl,
            category: apiProduct.category.name,
            rating: 4.5, // Default rating since API doesn't provide it
            liked: false, // Default to false since API doesn't provide it
            description: apiProduct.description,
          };
        });

        setState((prev) => ({
          ...prev,
          products: reset
            ? productsWithLiked
            : [...prev.products, ...productsWithLiked],
          loading: false,
          currentPage: meta.page,
          totalPages: meta.totalPages,
          hasMore: meta.hasNextPage,
        }));

        return response.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch products";

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        throw error;
      }
    },
    [initialLimit],
  );

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      return fetchProducts(state.currentPage + 1, initialLimit, false);
    }
  }, [
    state.loading,
    state.hasMore,
    state.currentPage,
    fetchProducts,
    initialLimit,
  ]);

  const refresh = useCallback(() => {
    return fetchProducts(1, initialLimit, true);
  }, [fetchProducts, initialLimit]);

  const toggleLike = useCallback((productId: number) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.id === productId
          ? { ...product, liked: !product.liked }
          : product,
      ),
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      products: [],
      loading: false,
      error: null,
      hasMore: true,
      currentPage: 0,
      totalPages: 0,
    });
  }, []);

  return {
    products: state.products,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    fetchProducts,
    loadMore,
    refresh,
    toggleLike,
    reset,
  };
};
