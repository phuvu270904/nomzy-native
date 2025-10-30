import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DriverTrackingState {
  // Current order being tracked by driver
  currentOrderId: number | null;
  currentOrderStatus: string | null;
  
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
}

const initialState: DriverTrackingState = {
  currentOrderId: null,
  currentOrderStatus: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,
};

const driverTrackingSlice = createSlice({
  name: "driverTracking",
  initialState,
  reducers: {
    // Connection state
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.isConnecting = false;
        state.connectionError = null;
      }
    },
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
      if (action.payload) {
        state.isConnecting = false;
      }
    },

    // Order state updates from socket
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: number; status: string }>
    ) => {
      const { orderId, status } = action.payload;
      // Update if it's the current order or set it as current
      if (state.currentOrderId === orderId || state.currentOrderId === null) {
        state.currentOrderId = orderId;
        state.currentOrderStatus = status;
      }
    },

    setCurrentOrder: (
      state,
      action: PayloadAction<{ orderId: number; status: string } | null>
    ) => {
      if (action.payload) {
        state.currentOrderId = action.payload.orderId;
        state.currentOrderStatus = action.payload.status;
      } else {
        state.currentOrderId = null;
        state.currentOrderStatus = null;
      }
    },

    // Clear/Reset actions
    clearError: (state) => {
      state.connectionError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrderId = null;
      state.currentOrderStatus = null;
    },
    resetDriverTracking: (state) => {
      return initialState;
    },
  },
});

export const {
  setConnected,
  setConnecting,
  setConnectionError,
  updateOrderStatus,
  setCurrentOrder,
  clearError,
  clearCurrentOrder,
  resetDriverTracking,
} = driverTrackingSlice.actions;

// Selectors
export const selectDriverTracking = (state: { driverTracking: DriverTrackingState }) =>
  state.driverTracking;

export const selectCurrentOrderStatus = (state: { driverTracking: DriverTrackingState }) =>
  state.driverTracking.currentOrderStatus;

export const selectCurrentOrderId = (state: { driverTracking: DriverTrackingState }) =>
  state.driverTracking.currentOrderId;

export default driverTrackingSlice.reducer;
