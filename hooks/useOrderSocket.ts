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
  updateOrderStatus,
} from "@/store/slices/orderTrackingSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Keep types for compatibility
export interface CreateOrderRequest {
  userId: number;
  restaurantId: number;
  addressId: number;
  orderItems: {
    productId: number;
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  couponId?: number;
  paymentMethod: string;
  notes?: string;
}

export interface Order {
  id: number;
  userId: number;
  restaurantId: number;
  status: string;
  total: number;
  orderItems: any[];
  createdAt: string;
  updatedAt: string;
}

// Get WebSocket base URL
const getSocketUrl = () => {
  if (!__DEV__) {
    return "wss://your-api-domain.com"; // Production URL
  }

  const { expoConfig } = Constants;
  if (expoConfig?.hostUri) {
    const ip = expoConfig.hostUri.split(":")[0];
    return `ws://${ip}:8190`;
  }

  return "ws://localhost:8190";
};

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
  
  // Local socket state
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [localIsConnected, setLocalIsConnected] = useState(false);
  const [localIsConnecting, setLocalIsConnecting] = useState(false);
  
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

  const userId = useRef<number | null>(null);
  const hasTriedAutoConnect = useRef(false);

  // Keep socketRef in sync with socket state
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Initialize user data
  const initUserData = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        userId.current =
          typeof user.user.id === "string"
            ? parseInt(user.user.id)
            : user.user.id;
        console.log("User ID loaded:", userId.current);
        return true;
      } else {
        console.log("No user data found in AsyncStorage");
        return false;
      }
    } catch (error) {
      console.error("Failed to get user data:", error);
      return false;
    }
  }, []);

  // Setup socket event listeners (except order-status-updated)
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    console.log("Setting up order socket event listeners");

    // Remove any existing listeners to avoid duplicates
    socket.off("order-created");
    socket.off("driver-assigned");
    socket.off("driver-location-update");
    socket.off("order-cancelled");

    // Order created
    socket.on("order-created", (order: Order) => {
      console.log("New order received:", order);
      dispatch(setCurrentOrder(order));
      dispatch(setOrderStatus(order.status));
    });

    // Driver assigned
    socket.on("driver-assigned", (data: any) => {
      console.log("Driver assigned:", data);
      
      if (data.order?.driver) {
        dispatch(setDriverInfo(data.order.driver));
      }
      
      // Set initial driver location if provided
      if (data.location) {
        console.log("Setting initial driver location:", data.location);
        const initialLocation = {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
        dispatch(setDriverLocation(initialLocation));
      }
    });

    // Driver location update
    socket.on("driver-location-update", (data: { location: { latitude: number; longitude: number } }) => {
      console.log("Driver location update:", data);
      if (data.location) {
        const updatedLocation = {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
        dispatch(updateDriverLocation(updatedLocation));
      }
    });

    // Order cancelled
    socket.on("order-cancelled", (data: { orderId: number }) => {
      console.log("Order cancelled:", data);
      dispatch(updateOrderStatus({ orderId: data.orderId, status: "cancelled" }));
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up order socket listeners");
      socket.off("order-created");
      socket.off("driver-assigned");
      socket.off("driver-location-update");
      socket.off("order-cancelled");
    };
  }, [socket, isConnected, dispatch]);

  // Setup order-status-updated listener separately (like driver hook)
  useEffect(() => {
    if (socket && isConnected) {
      console.log("Setting up order-status-updated listener on connected socket");
      
      // Remove any existing listener first
      socket.off("order-status-updated");
      
      // Add the listener and dispatch to Redux
      socket.on("order-status-updated", (data: { orderId: number; status: string }) => {
        console.log("Order status updated (user):", data);
        console.log(
          "Order status update data structure:",
          JSON.stringify(data, null, 2),
        );
        
        // Dispatch to Redux store
        console.log("Dispatching order status update to Redux");
        dispatch(updateOrderStatus({ orderId: data.orderId, status: data.status }));
      });
      
      console.log("order-status-updated listener registered for user");
      
      // Cleanup
      return () => {
        socket.off("order-status-updated");
      };
    }
  }, [socket, isConnected, dispatch]);

  // Connect function
  const connect = useCallback(async (): Promise<boolean> => {
    if (isConnected || isConnecting) {
      return isConnected;
    }

    try {
      console.log("Attempting to connect to order socket...");
      dispatch(setConnecting(true));
      dispatch(setConnectionError(null));

      // Initialize user data first
      const userDataLoaded = await initUserData();
      if (!userDataLoaded || !userId.current) {
        throw new Error("Failed to load user data");
      }

      // Create new socket connection
      const socketUrl = getSocketUrl();
      console.log("Connecting to:", `${socketUrl}/orders`);
      
      const newSocket = io(`${socketUrl}/orders`, {
        query: {
          userId: userId.current.toString(),
          role: "user",
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Return a promise that resolves when connection is established
      return new Promise((resolve) => {
        // Setup connection event handlers
        newSocket.on("connect", () => {
          console.log("Order socket connected successfully");
          setSocket(newSocket);
          setLocalIsConnected(true);
          setLocalIsConnecting(false);
          dispatch(setConnected(true));
          dispatch(setConnecting(false));
          dispatch(setConnectionError(null));
          resolve(true);
        });

        newSocket.on("disconnect", (reason: string) => {
          console.log("Order socket disconnected:", reason);
          setLocalIsConnected(false);
          setLocalIsConnecting(false);
          setSocket(null);
          dispatch(setConnected(false));
          dispatch(setConnecting(false));
        });

        newSocket.on("connect_error", (error: Error) => {
          console.error("Order socket connection error:", error.message);
          setLocalIsConnecting(false);
          dispatch(setConnecting(false));
          dispatch(setConnectionError(error.message));
          resolve(false);
        });
      });
    } catch (error) {
      console.error("Failed to connect to order socket:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      dispatch(setConnectionError(errorMessage));
      dispatch(setConnecting(false));
      setLocalIsConnecting(false);
      return false;
    }
  }, [isConnected, isConnecting, dispatch, initUserData]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("Disconnecting order socket");
      socketRef.current.disconnect();
      setSocket(null);
    }
    setLocalIsConnected(false);
    setLocalIsConnecting(false);
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

        // Get auth token
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          throw new Error("No auth token found");
        }

        // Make API call to create order
        const apiUrl = getSocketUrl()
          .replace("ws://", "http://")
          .replace("wss://", "https://");
        
        const response = await fetch(`${apiUrl}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to create order");
        }

        const order: Order = await response.json();
        console.log("Order created successfully:", order);

        // Update Redux state
        dispatch(setCurrentOrder(order));
        dispatch(setOrderStatus(order.status));
        dispatch(setDriverInfo(null)); // Reset driver info for new order

        // Join the order room after creating the order
        if (socketRef.current && isConnected) {
          console.log("Joining order room:", order.id);
          socketRef.current.emit("join-order-room", { orderId: order.id });
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
      if (!socketRef.current || !isConnected) {
        console.warn("Cannot join order room: socket not connected");
        return;
      }
      console.log("Joining order room:", orderId);
      socketRef.current.emit("join-order-room", { orderId });
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
  }, [isAuthenticated, isConnected, disconnect]);

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
