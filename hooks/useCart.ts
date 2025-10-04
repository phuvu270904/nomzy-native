import { useCallback, useEffect, useState } from "react";

import {
    AddToCartRequest,
    Cart,
    cartApi,
    UpdateCartItemRequest,
} from "@/api/cartApi";

interface UseCartReturn {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<boolean>;
  updateCartItem: (itemId: number, quantity: number) => Promise<boolean>;
  removeCartItem: (itemId: number) => Promise<boolean>;
  clearError: () => void;
}

export const useCart = (): UseCartReturn => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const cartData = await cartApi.getCart();
      setCart(cartData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch cart";
      setError(errorMessage);
      console.error("Failed to fetch cart:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (productId: number, quantity: number): Promise<boolean> => {
      try {
        setError(null);
        const request: AddToCartRequest = { productId, quantity };
        const newCartItem = await cartApi.addToCart(request);

        // Update local cart state
        setCart((prevCart) => {
          if (!prevCart) return prevCart;

          // Check if item already exists in cart
          const existingItemIndex = prevCart.cartItems.findIndex(
            (item) => item.productId === productId,
          );

          if (existingItemIndex !== -1) {
            // Update existing item
            const updatedCartItems = [...prevCart.cartItems];
            updatedCartItems[existingItemIndex] = newCartItem;
            return { ...prevCart, cartItems: updatedCartItems };
          } else {
            // Add new item
            return {
              ...prevCart,
              cartItems: [...prevCart.cartItems, newCartItem],
            };
          }
        });

        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to add item to cart";
        setError(errorMessage);
        console.error("Failed to add to cart:", err);
        return false;
      }
    },
    [],
  );

  const updateCartItem = useCallback(
    async (itemId: number, quantity: number): Promise<boolean> => {
      try {
        setError(null);
        const request: UpdateCartItemRequest = { quantity };
        const updatedCartItem = await cartApi.updateCartItem(itemId, request);

        // Update local cart state
        setCart((prevCart) => {
          if (!prevCart) return prevCart;

          const updatedCartItems = prevCart.cartItems.map((item) =>
            item.id === itemId ? updatedCartItem : item,
          );

          return { ...prevCart, cartItems: updatedCartItems };
        });

        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to update cart item";
        setError(errorMessage);
        console.error("Failed to update cart item:", err);
        return false;
      }
    },
    [],
  );

  const removeCartItem = useCallback(
    async (itemId: number): Promise<boolean> => {
      try {
        setError(null);
        await cartApi.removeCartItem(itemId);

        // Update local cart state
        setCart((prevCart) => {
          if (!prevCart) return prevCart;

          const updatedCartItems = prevCart.cartItems.filter(
            (item) => item.id !== itemId,
          );

          return { ...prevCart, cartItems: updatedCartItems };
        });

        return true;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to remove cart item";
        setError(errorMessage);
        console.error("Failed to remove cart item:", err);
        return false;
      }
    },
    [],
  );

  // Fetch cart on hook initialization
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    cart,
    isLoading,
    error,
    refetch: fetchCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearError,
  };
};
