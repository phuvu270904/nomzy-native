import { Order } from "@/services/orderSocketService";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DriverInfo {
  id: number;
  name: string;
  phone?: string;
  plateNumber?: string;
  vehicleType?: string;
  rating?: number;
  avatar?: string;
  [key: string]: any;
}

interface DriverLocation {
  latitude: number;
  longitude: number;
}

interface OrderTrackingState {
  currentOrder: Order | null;
  orderStatus: string | null;
  driverInfo: DriverInfo | null;
  driverLocation: DriverLocation | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  hasJoinedRoom: Record<number, boolean>; // Track which rooms we've joined
}

const initialState: OrderTrackingState = {
  currentOrder: null,
  orderStatus: null,
  driverInfo: null,
  driverLocation: null,
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  hasJoinedRoom: {},
};

const orderTrackingSlice = createSlice({
  name: "orderTracking",
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

    // Order state
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
      if (action.payload) {
        state.orderStatus = action.payload.status;
      }
    },
    setOrderStatus: (state, action: PayloadAction<string | null>) => {
      state.orderStatus = action.payload;
      if (state.currentOrder && action.payload) {
        state.currentOrder.status = action.payload;
      }
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: number; status: string }>
    ) => {
      const { orderId, status } = action.payload;
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = status;
        state.orderStatus = status;
      }
    },

    // Driver state
    setDriverInfo: (state, action: PayloadAction<DriverInfo | null>) => {
      state.driverInfo = action.payload;
    },
    setDriverLocation: (state, action: PayloadAction<DriverLocation | null>) => {
      state.driverLocation = action.payload;
    },
    updateDriverLocation: (state, action: PayloadAction<DriverLocation>) => {
      state.driverLocation = action.payload;
    },

    // Room management
    setRoomJoined: (state, action: PayloadAction<number>) => {
      state.hasJoinedRoom[action.payload] = true;
    },
    clearRoomJoined: (state, action: PayloadAction<number>) => {
      delete state.hasJoinedRoom[action.payload];
    },

    // Clear/Reset actions
    clearError: (state) => {
      state.connectionError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.orderStatus = null;
      state.driverInfo = null;
      state.driverLocation = null;
    },
    clearDriverInfo: (state) => {
      state.driverInfo = null;
      state.driverLocation = null;
    },
    resetOrderTracking: (state) => {
      return initialState;
    },
  },
});

export const {
  setConnected,
  setConnecting,
  setConnectionError,
  setCurrentOrder,
  setOrderStatus,
  updateOrderStatus,
  setDriverInfo,
  setDriverLocation,
  updateDriverLocation,
  setRoomJoined,
  clearRoomJoined,
  clearError,
  clearCurrentOrder,
  clearDriverInfo,
  resetOrderTracking,
} = orderTrackingSlice.actions;

// Selectors
export const selectOrderTracking = (state: { orderTracking: OrderTrackingState }) => 
  state.orderTracking;

export const selectDriverInfo = (state: { orderTracking: OrderTrackingState }) => 
  state.orderTracking.driverInfo;

export const selectDriverLocation = (state: { orderTracking: OrderTrackingState }) => 
  state.orderTracking.driverLocation;

export const selectCurrentOrder = (state: { orderTracking: OrderTrackingState }) => 
  state.orderTracking.currentOrder;

export const selectOrderStatus = (state: { orderTracking: OrderTrackingState }) => 
  state.orderTracking.orderStatus;

export default orderTrackingSlice.reducer;
