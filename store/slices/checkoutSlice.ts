import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Address {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: "card" | "cash" | "digital_wallet";
  name: string;
  details: string;
  isDefault: boolean;
}

interface CheckoutState {
  selectedAddress: Address | null;
  selectedPaymentMethod: PaymentMethod | null;
  orderNotes: string;
  deliveryInstructions: string;
  isPlacingOrder: boolean;
  orderError: string | null;
}

const initialState: CheckoutState = {
  selectedAddress: null,
  selectedPaymentMethod: null,
  orderNotes: "",
  deliveryInstructions: "",
  isPlacingOrder: false,
  orderError: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setSelectedAddress: (state, action: PayloadAction<Address>) => {
      state.selectedAddress = action.payload;
    },
    setSelectedPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
      state.selectedPaymentMethod = action.payload;
    },
    setOrderNotes: (state, action: PayloadAction<string>) => {
      state.orderNotes = action.payload;
    },
    setDeliveryInstructions: (state, action: PayloadAction<string>) => {
      state.deliveryInstructions = action.payload;
    },
    setPlacingOrder: (state, action: PayloadAction<boolean>) => {
      state.isPlacingOrder = action.payload;
    },
    setOrderError: (state, action: PayloadAction<string | null>) => {
      state.orderError = action.payload;
    },
    clearCheckout: (state) => {
      state.selectedAddress = null;
      state.selectedPaymentMethod = null;
      state.orderNotes = "";
      state.deliveryInstructions = "";
      state.isPlacingOrder = false;
      state.orderError = null;
    },
  },
});

export const {
  setSelectedAddress,
  setSelectedPaymentMethod,
  setOrderNotes,
  setDeliveryInstructions,
  setPlacingOrder,
  setOrderError,
  clearCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
