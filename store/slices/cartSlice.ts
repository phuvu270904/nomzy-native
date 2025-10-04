import {
    AddToCartRequest,
    Cart,
    cartApi,
    UpdateCartItemRequest,
} from "@/api/cartApi";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

// Async thunks for API calls
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const cart = await cartApi.getCart();
      return cart;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch cart",
      );
    }
  },
);

export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (
    { productId, quantity }: { productId: number; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      const request: AddToCartRequest = { productId, quantity };
      const cartItem = await cartApi.addToCart(request);
      return { cartItem, productId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to add item to cart",
      );
    }
  },
);

export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItem",
  async (
    { itemId, quantity }: { itemId: number; quantity: number },
    { rejectWithValue },
  ) => {
    try {
      const request: UpdateCartItemRequest = { quantity };
      const updatedCartItem = await cartApi.updateCartItem(itemId, request);
      return updatedCartItem;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update cart item",
      );
    }
  },
);

export const removeCartItemAsync = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId: number, { rejectWithValue }) => {
    try {
      await cartApi.removeCartItem(itemId);
      return itemId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to remove cart item",
      );
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCart: (state) => {
      state.cart = null;
    },
    // Optimistic updates for better UX
    updateQuantityOptimistic: (
      state,
      action: PayloadAction<{ itemId: number; quantity: number }>,
    ) => {
      if (state.cart && state.cart.cartItems) {
        const itemIndex = state.cart.cartItems.findIndex(
          (item) => item.id === action.payload.itemId,
        );
        if (itemIndex !== -1) {
          state.cart.cartItems[itemIndex].quantity = action.payload.quantity;
        }
      }
    },
    removeItemOptimistic: (state, action: PayloadAction<number>) => {
      if (state.cart && state.cart.cartItems) {
        state.cart.cartItems = state.cart.cartItems.filter(
          (item) => item.id !== action.payload,
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add to cart
      .addCase(addToCartAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        if (state.cart) {
          const { cartItem, productId } = action.payload;
          const existingItemIndex = state.cart.cartItems.findIndex(
            (item) => item.productId === productId,
          );

          if (existingItemIndex !== -1) {
            // Update existing item
            state.cart.cartItems[existingItemIndex] = cartItem;
          } else {
            // Add new item
            state.cart.cartItems.push(cartItem);
          }
        }
        state.error = null;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // Update cart item
      .addCase(updateCartItemAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        if (state.cart && state.cart.cartItems) {
          const itemIndex = state.cart.cartItems.findIndex(
            (item) => item.id === action.payload.id,
          );
          if (itemIndex !== -1) {
            state.cart.cartItems[itemIndex] = action.payload;
          }
        }
        state.error = null;
      })
      .addCase(updateCartItemAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // Revert optimistic update by refetching cart
        // You might want to handle this differently based on your UX preferences
      })

      // Remove cart item
      .addCase(removeCartItemAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(removeCartItemAsync.fulfilled, (state, action) => {
        if (state.cart && state.cart.cartItems) {
          state.cart.cartItems = state.cart.cartItems.filter(
            (item) => item.id !== action.payload,
          );
        }
        state.error = null;
      })
      .addCase(removeCartItemAsync.rejected, (state, action) => {
        state.error = action.payload as string;
        // Revert optimistic update by refetching cart
      });
  },
});

export const {
  clearError,
  clearCart,
  updateQuantityOptimistic,
  removeItemOptimistic,
} = cartSlice.actions;

export default cartSlice.reducer;
