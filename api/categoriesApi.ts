import apiClient from "@/utils/apiClient";

export interface Product {
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
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithProducts extends Category {
  products: Product[];
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get("/categories");
  return response.data;
};

// Get category by ID with products
export const getCategoryProducts = async (
  categoryId: number
): Promise<CategoryWithProducts> => {
  const response = await apiClient.get(`/categories/${categoryId}/products`);
  return response.data;
};
