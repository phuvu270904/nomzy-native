import { Alert } from "react-native";

import { cartApi } from "@/api/cartApi";

/**
 * Utility function to add an item to cart with proper error handling
 * @param productId The ID of the product to add
 * @param quantity The quantity to add (default: 1)
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const addToCartHelper = async (
  productId: number,
  quantity: number = 1,
): Promise<boolean> => {
  try {
    await cartApi.addToCart({ productId, quantity });

    // Show success message
    Alert.alert("Added to Cart", `Item successfully added to your cart.`, [
      { text: "OK" },
    ]);

    return true;
  } catch (error: any) {
    console.error("Failed to add item to cart:", error);

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to add item to cart";

    Alert.alert("Error", errorMessage, [{ text: "OK" }]);

    return false;
  }
};

/**
 * Utility function to quickly increment an item quantity in cart
 * @param itemId The cart item ID
 * @param currentQuantity Current quantity of the item
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const incrementCartItemHelper = async (
  itemId: number,
  currentQuantity: number,
): Promise<boolean> => {
  try {
    await cartApi.updateCartItem(itemId, { quantity: currentQuantity + 1 });
    return true;
  } catch (error: any) {
    console.error("Failed to update cart item:", error);

    const errorMessage =
      error.response?.data?.message || error.message || "Failed to update cart";

    Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    return false;
  }
};

/**
 * Utility function to quickly decrement an item quantity in cart
 * @param itemId The cart item ID
 * @param currentQuantity Current quantity of the item
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export const decrementCartItemHelper = async (
  itemId: number,
  currentQuantity: number,
): Promise<boolean> => {
  if (currentQuantity <= 1) {
    Alert.alert(
      "Remove Item",
      "Would you like to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await cartApi.removeCartItem(itemId);
            } catch (error: any) {
              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to remove item";
              Alert.alert("Error", errorMessage, [{ text: "OK" }]);
            }
          },
        },
      ],
    );
    return true;
  }

  try {
    await cartApi.updateCartItem(itemId, { quantity: currentQuantity - 1 });
    return true;
  } catch (error: any) {
    console.error("Failed to update cart item:", error);

    const errorMessage =
      error.response?.data?.message || error.message || "Failed to update cart";

    Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    return false;
  }
};
