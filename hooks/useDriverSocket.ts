import { useAuth } from "@/hooks/useAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface OrderRequest {
  id: string;
  orderId: number;
  customerName: string;
  pickupLocation: string;
  destination: string;
  duration: string;
  distance: string;
  payment: string;
  amount: number;
  currency: string;
  orderTime: Date;
  restaurantName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface UseDriverSocketReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Driver status
  isOnline: boolean;
  setOnline: (online: boolean) => void;

  // Order requests
  currentOrderRequest: OrderRequest | null;
  acceptOrder: (orderId: number) => void;
  declineOrder: (orderId: number) => void;

  // Driver location and order status
  updateDriverLocation: (
    orderId: number,
    latitude: number,
    longitude: number,
  ) => void;
  updateOrderStatus: (
    orderId: number,
    status: string,
  ) => void;

  // Manual connection control
  connect: () => Promise<boolean>;
  disconnect: () => void;

  // Clear states
  clearError: () => void;
  clearOrderRequest: () => void;
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

export const useDriverSocket = (): UseDriverSocketReturn => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isOnline, setIsOnlineState] = useState(false);
  const [currentOrderRequest, setCurrentOrderRequest] =
    useState<OrderRequest | null>(null);

  const userId = useRef<number | null>(null);

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
        console.log("Driver ID loaded:", userId.current);
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

  // Connect function
  const connect = useCallback(async (): Promise<boolean> => {
    if (isConnected || isConnecting) {
      return isConnected;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Initialize user data
      const hasUserData = await initUserData();
      if (!hasUserData || !userId.current) {
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
          throw new Error("User not authenticated. Please log in first.");
        }
        throw new Error("User ID not found in storage. Please log in again.");
      }

      const socketUrl = getSocketUrl();
      console.log("Driver connecting to:", `${socketUrl}/orders`);

      const newSocket = io(`${socketUrl}/orders`, {
        query: {
          userId: userId.current.toString(),
          role: "driver",
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
      });

      return new Promise((resolve) => {
        if (!newSocket) {
          setIsConnecting(false);
          resolve(false);
          return;
        }

        newSocket.on("connect", () => {
          console.log("Driver connected to order socket");
          setSocket(newSocket);
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionError(null);
          resolve(true);
        });

        newSocket.on("disconnect", () => {
          console.log("Driver disconnected from order socket");
          setIsConnected(false);
          setIsConnecting(false);
          setSocket(null);
        });

        newSocket.on("connect_error", (error) => {
          console.error("Driver connection error:", error);
          setIsConnected(false);
          setIsConnecting(false);
          setConnectionError(error.message);
          setSocket(null);
          resolve(false);
        });

        newSocket.on("error", (data) => {
          console.error("Driver socket error:", data);
          setConnectionError(data.message);
        });

        // Driver-specific event listeners
        newSocket.on("order-request", (data: any) => {
          console.log("Order request received:", data);
          console.log(
            "Order request data structure:",
            JSON.stringify(data, null, 2),
          );

          // Extract the order from the nested structure
          const orderData = data.order || data;

          // Transform the data to match our OrderRequest interface
          const orderRequest: OrderRequest = {
            id: orderData.id?.toString() || `req-${orderData.id}`,
            orderId: orderData.id, // Use order.id as the orderId
            customerName:
              orderData.user?.name ||
              orderData.customerName ||
              "Unknown Customer",
            pickupLocation:
              orderData.restaurant?.address ||
              orderData.pickupLocation ||
              orderData.restaurantAddress ||
              `${orderData.restaurant?.name || "Restaurant"}`,
            destination:
              orderData.address?.streetAddress ||
              orderData.destination ||
              orderData.customerAddress ||
              `${orderData.address?.city || "Unknown"}, ${orderData.address?.state || ""}`.trim(),
            duration:
              orderData.estimatedDuration || data.estimatedDuration || "N/A",
            distance:
              orderData.estimatedDistance || data.estimatedDistance || "N/A",
            payment: orderData.paymentMethod || "Unknown",
            amount: parseFloat(orderData.total) || orderData.amount || 0,
            currency: orderData.currency || "USD",
            orderTime: orderData.createdAt
              ? new Date(orderData.createdAt)
              : new Date(),
            restaurantName: orderData.restaurant?.name,
            customerPhone: orderData.user?.phone_number,
            notes: orderData.notes,
          };

          console.log("Transformed order request:", orderRequest);
          console.log("Order ID being set:", orderRequest.orderId);
          setCurrentOrderRequest(orderRequest);
        });

        newSocket.on("order-cancelled", (data: any) => {
          console.log("Order cancelled:", data);
          if (
            currentOrderRequest &&
            currentOrderRequest.orderId === data.orderId
          ) {
            setCurrentOrderRequest(null);
          }
        });

        newSocket.on("driver-assigned", (data: any) => {
          console.log("Driver assigned to order:", data);
          console.log(
            "Driver assigned data structure:",
            JSON.stringify(data, null, 2),
          );

          if (data.order && data.order.id) {
            console.log("Assigned to order ID:", data.order.id);
          } else {
            console.log("No order ID found in assignment data");
          }

          // Clear the current order request since it's been accepted
          setCurrentOrderRequest(null);
        });
      });
    } catch (error) {
      console.error("Failed to connect driver socket:", error);
      setConnectionError(
        error instanceof Error ? error.message : "Connection failed",
      );
      setIsConnecting(false);
      return false;
    }
  }, [isConnected, isConnecting, initUserData, currentOrderRequest]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
      setConnectionError(null);
      setCurrentOrderRequest(null);
    }
  }, [socket]);

  // Set online status and connect/disconnect accordingly
  const setOnline = useCallback(
    async (online: boolean) => {
      setIsOnlineState(online);

      if (online) {
        // Connect to socket when going online
        const connected = await connect();
        if (!connected) {
          console.error("Failed to connect driver socket when going online");
          setIsOnlineState(false);
        }
      } else {
        // Disconnect when going offline
        disconnect();
      }
    },
    [connect, disconnect],
  );

  // Accept order function
  const acceptOrder = useCallback(
    (orderId: number) => {
      if (!socket || !isConnected) {
        console.error("Cannot accept order: socket not connected");
        return;
      }

      console.log("Driver accepting order:", orderId);
      console.log("Order ID type:", typeof orderId);
      console.log("Is orderId valid?", orderId && !isNaN(orderId));
      console.log("Current order request:", currentOrderRequest);

      if (!orderId || isNaN(orderId)) {
        console.error("Invalid order ID provided:", orderId);
        return;
      }

      // Validate that the orderId matches the current order request
      if (currentOrderRequest && currentOrderRequest.orderId !== orderId) {
        console.error(
          "Order ID mismatch! Trying to accept order:",
          orderId,
          "but current request is for order:",
          currentOrderRequest.orderId,
        );
        return;
      }

      console.log("Emitting driver-accept-order with orderId:", orderId);
      socket.emit("driver-accept-order", { orderId });

      // Clear the current order request
      setCurrentOrderRequest(null);
    },
    [socket, isConnected, currentOrderRequest],
  );

  // Decline order function
  const declineOrder = useCallback(
    (orderId: number) => {
      if (!socket || !isConnected) {
        console.error("Cannot decline order: socket not connected");
        return;
      }

      console.log("Driver declining order:", orderId);
      socket.emit("driver-decline-order", { orderId });

      // Clear the current order request
      setCurrentOrderRequest(null);
    },
    [socket, isConnected],
  );

  // Clear error function
  const clearError = useCallback(() => {
    setConnectionError(null);
  }, []);

  // Clear order request function
  const clearOrderRequest = useCallback(() => {
    setCurrentOrderRequest(null);
  }, []);

  // Update driver location function
  const updateDriverLocation = useCallback(
    (orderId: number, latitude: number, longitude: number) => {
      if (!socket || !isConnected) {
        console.error("Cannot update location: socket not connected");
        return;
      }

      console.log("Driver updating location for order:", orderId, {
        latitude,
        longitude,
      });
      socket.emit("driver-location-update", {
        orderId,
        location: { latitude, longitude },
      });
    },
    [socket, isConnected],
  );

  // Update order status function
  const updateOrderStatus = useCallback(
    (orderId: number, status: string) => {
      if (!socket || !isConnected) {
        console.error("Cannot update order status: socket not connected");
        return;
      }

      console.log("Driver updating order status:", orderId, status);
      socket.emit("driver-update-order-status", { orderId, status });
    },
    [socket, isConnected],
  );

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!isAuthenticated && socket) {
      disconnect();
      setIsOnlineState(false);
    }
  }, [isAuthenticated, socket, disconnect]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,

    // Driver status
    isOnline,
    setOnline,

    // Order requests
    currentOrderRequest,
    acceptOrder,
    declineOrder,

    // Driver location and order status
    updateDriverLocation,
    updateOrderStatus,

    // Manual connection control
    connect,
    disconnect,

    // Clear states
    clearError,
    clearOrderRequest,
  };
};
