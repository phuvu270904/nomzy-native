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

          // Transform the data to match our OrderRequest interface
          const orderRequest: OrderRequest = {
            id: data.id || `req-${data.orderId}`,
            orderId: data.orderId,
            customerName: data.customerName || "Unknown Customer",
            pickupLocation:
              data.pickupLocation ||
              data.restaurantAddress ||
              "Unknown Location",
            destination:
              data.destination || data.customerAddress || "Unknown Destination",
            duration: data.estimatedDuration || "N/A",
            distance: data.estimatedDistance || "N/A",
            payment: data.paymentMethod || "Unknown",
            amount: data.total || data.amount || 0,
            currency: data.currency || "VND",
            orderTime: data.orderTime ? new Date(data.orderTime) : new Date(),
            restaurantName: data.restaurantName,
            customerPhone: data.customerPhone,
            notes: data.notes,
          };

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
          // Clear the current order request since it's been accepted
          setCurrentOrderRequest(null);
        });

        // Set a timeout for connection
        setTimeout(() => {
          if (!isConnected) {
            newSocket.disconnect();
            setIsConnecting(false);
            resolve(false);
          }
        }, 10000);
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
      socket.emit("driver-accept-order", { orderId });

      // Clear the current order request
      setCurrentOrderRequest(null);
    },
    [socket, isConnected],
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

    // Manual connection control
    connect,
    disconnect,

    // Clear states
    clearError,
    clearOrderRequest,
  };
};
