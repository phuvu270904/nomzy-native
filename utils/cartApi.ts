import { apiClient } from "@/utils/apiClient";

// Types based on API response structure
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice?: string;
  imageUrl: string;
  isActive: boolean;
  restaurantId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  price: string;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

export interface Cart {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Cart API functions
export const cartApi = {
  // Get user's cart
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<Cart>("/carts");
    return response.data;
  },

  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<CartItem> => {
    const response = await apiClient.post<CartItem>("/carts/items", data);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (
    itemId: number,
    data: UpdateCartItemRequest,
  ): Promise<CartItem> => {
    const response = await apiClient.put<CartItem>(
      `/carts/items/${itemId}`,
      data,
    );
    return response.data;
  },

  // Remove item from cart
  removeCartItem: async (itemId: number): Promise<void> => {
    await apiClient.delete(`/carts/items/${itemId}`);
  },
};
