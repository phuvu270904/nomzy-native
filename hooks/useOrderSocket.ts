/**
 * useOrderSocket Hook
 * 
 * This hook manages the WebSocket connection for real-time order tracking.
 * It uses Redux Toolkit for state management to ensure that order tracking data
 * (including driver info, location, and order status) persists across component
 * re-renders and navigation.
 * 
 * Key Features:
 * - Persistent state: Driver info and location remain available when navigating
 *   between screens (e.g., from searching-driver to order-tracking)
 * - Real-time updates: Listens to socket events and updates Redux state
 * - Auto-connection: Automatically connects when user is authenticated
 * 
 * State is stored in Redux under the `orderTracking` slice, which includes:
 * - currentOrder: The active order being tracked
 * - orderStatus: Current status of the order
 * - driverInfo: Information about the assigned driver
 * - driverLocation: Real-time GPS coordinates of the driver
 * - Connection state: isConnected, isConnecting, connectionError
 */

import { useAuth } from "@/hooks/useAuth";
import {
  CreateOrderRequest,
  DriverLocationUpdate,
  Order,
  orderSocketService,
  OrderStatusUpdate,
} from "@/services/orderSocketService";
import {
  clearCurrentOrder,
  clearError,
  setConnected,
  setConnecting,
  setConnectionError,
  setCurrentOrder,
  setDriverInfo,
  setDriverLocation,
  setOrderStatus,
  updateDriverLocation,
  updateOrderStatus
} from "@/store/slices/orderTrackingSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useCallback, useEffect, useRef } from "react";

export interface UseOrderSocketReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Order operations
  createOrder: (orderData: CreateOrderRequest) => Promise<Order | null>;
  joinOrderRoom: (orderId: number) => void;

  // Current order tracking
  currentOrder: Order | null;
  orderStatus: string | null;
  driverInfo: any | null;
  driverLocation: { latitude: number; longitude: number } | null;

  // Manual connection control
  connect: () => Promise<boolean>;
  disconnect: () => void;

  // Clear states
  clearError: () => void;
  clearCurrentOrder: () => void;
}

export const useOrderSocket = (): UseOrderSocketReturn => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const {
    isConnected,
    isConnecting,
    connectionError,
    currentOrder,
    orderStatus,
    driverInfo,
    driverLocation,
  } = useAppSelector((state) => state.orderTracking);

  // Use ref to track if we've set up listeners to avoid duplicates
  const listenersSetup = useRef(false);
  const hasTriedAutoConnect = useRef(false);

  // Setup event listeners
  useEffect(() => {
    if (listenersSetup.current) {
      return;
    }

    console.log("Setting up order socket event listeners");

    // Connection events
    orderSocketService.onConnected(() => {
      console.log("Order socket connected");
      dispatch(setConnected(true));
      dispatch(setConnecting(false));
      dispatch(setConnectionError(null));
    });

    orderSocketService.onDisconnected(() => {
      console.log("Order socket disconnected");
      dispatch(setConnected(false));
      dispatch(setConnecting(false));
    });

    orderSocketService.onError((error: string) => {
      console.error("Order socket error:", error);
      dispatch(setConnectionError(error));
      dispatch(setConnecting(false));
    });

    // Order events
    orderSocketService.onNewOrder((order: Order) => {
      console.log("New order received in hook:", order);
      dispatch(setCurrentOrder(order));
      dispatch(setOrderStatus(order.status));
    });

    orderSocketService.onOrderStatusUpdated((data: OrderStatusUpdate) => {
      console.log("Order status updated in hook:", data);
      dispatch(updateOrderStatus({ orderId: data.orderId, status: data.status }));
    });

    orderSocketService.onDriverAssigned((data: any) => {
      console.log("Driver assigned in hook:", data);
      console.log("Driver assigned event full data:", JSON.stringify(data, null, 2));
      
      dispatch(setDriverInfo(data.order.driver));
      
      // Set initial driver location if provided
      if (data.location) {
        console.log("Setting initial driver location from driver-assigned:", data.location);
        const initialLocation = {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
        console.log(initialLocation, "location neeee");
        
        dispatch(setDriverLocation(initialLocation));
        console.log("Initial driver location set to:", initialLocation);
      } else {
        console.warn("No location data in driver-assigned event");
      }
    });

    orderSocketService.onOrderCancelled((data: any) => {
      console.log("Order cancelled in hook:", data);
      dispatch(updateOrderStatus({ orderId: data.orderId, status: "cancelled" }));
    });

    orderSocketService.onDriverLocationUpdate((data: DriverLocationUpdate) => {
      // Update driver location for any order we're tracking
      // Don't require currentOrder since we might just be viewing/tracking an order
      if (data.location) {
        const updatedLocation = {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
        dispatch(updateDriverLocation(updatedLocation));
      }
    });

    listenersSetup.current = true;

    // Cleanup function
    return () => {
      console.log("Cleaning up order socket listeners");
      // Note: We don't actually clean up listeners here since the service is a singleton
      // and might be used by other components. The service manages its own lifecycle.
      // DO NOT reset listenersSetup.current here as it causes re-registration
    };
  }, [dispatch]); // Add dispatch dependency

  // Connect function
  const connect = useCallback(async (): Promise<boolean> => {
    if (isConnected || isConnecting) {
      return isConnected;
    }

    dispatch(setConnecting(true));
    dispatch(setConnectionError(null));

    try {
      const connected = await orderSocketService.connect();
      if (connected) {
        dispatch(setConnected(true));
        dispatch(setConnectionError(null));
      } else {
        dispatch(setConnectionError("Failed to connect to order service"));
      }
      dispatch(setConnecting(false));
      return connected;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      dispatch(setConnectionError(errorMessage));
      dispatch(setConnecting(false));
      return false;
    }
  }, [isConnected, isConnecting, dispatch]);

  // Disconnect function
  const disconnect = useCallback(() => {
    orderSocketService.disconnect();
    dispatch(setConnected(false));
    dispatch(setConnecting(false));
    dispatch(setConnectionError(null));
  }, [dispatch]);

  // Create order function
  const createOrder = useCallback(
    async (orderData: CreateOrderRequest): Promise<Order | null> => {
      try {
        // Ensure we're connected before creating order
        if (!isConnected) {
          const connected = await connect();
          if (!connected) {
            throw new Error("Could not connect to order service");
          }
        }

        const order = await orderSocketService.createOrder(orderData);
        if (order) {
          dispatch(setCurrentOrder(order));
          dispatch(setOrderStatus(order.status));
          dispatch(setDriverInfo(null)); // Reset driver info for new order
        }
        return order;
      } catch (error) {
        console.error("Failed to create order in hook:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create order";
        dispatch(setConnectionError(errorMessage));
        return null;
      }
    },
    [isConnected, connect, dispatch],
  );

  // Join order room function
  const joinOrderRoom = useCallback(
    (orderId: number) => {
      if (!isConnected) {
        console.warn("Cannot join order room: not connected to socket");
        return;
      }
      orderSocketService.joinOrderRoom(orderId);
    },
    [isConnected],
  );

  // Clear error function
  const clearErrorCallback = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current order function
  const clearCurrentOrderCallback = useCallback(() => {
    dispatch(clearCurrentOrder());
  }, [dispatch]);

  // Auto-connect when user becomes authenticated
  useEffect(() => {
    let mounted = true;

    const autoConnect = async () => {
      // Only auto-connect if user is authenticated and we haven't tried yet
      if (
        isAuthenticated &&
        user &&
        !isConnected &&
        !isConnecting &&
        !hasTriedAutoConnect.current
      ) {
        console.log("User authenticated, auto-connecting to order socket...");
        hasTriedAutoConnect.current = true;
        const connected = await connect();
        if (mounted) {
          console.log("Auto-connect result:", connected);
        }
      }
    };

    autoConnect();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user, isConnected, isConnecting, connect]);

  // Reset auto-connect flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasTriedAutoConnect.current = false;
      if (isConnected) {
        disconnect();
      }
    }
  }, [isAuthenticated, isConnected]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,

    // Order operations
    createOrder,
    joinOrderRoom,

    // Current order tracking
    currentOrder,
    orderStatus,
    driverInfo,
    driverLocation,

    // Manual connection control
    connect,
    disconnect,

    // Clear states
    clearError: clearErrorCallback,
    clearCurrentOrder: clearCurrentOrderCallback,
  };
};
