import { useAuth } from "@/hooks/useAuth";
import {
  CreateOrderRequest,
  DriverLocationUpdate,
  Order,
  orderSocketService,
  OrderStatusUpdate,
} from "@/services/orderSocketService";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState<any | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
    });

    orderSocketService.onDisconnected(() => {
      console.log("Order socket disconnected");
      setIsConnected(false);
      setIsConnecting(false);
    });

    orderSocketService.onError((error: string) => {
      console.error("Order socket error:", error);
      setConnectionError(error);
      setIsConnecting(false);
    });

    // Order events
    orderSocketService.onNewOrder((order: Order) => {
      console.log("New order received in hook:", order);
      setCurrentOrder(order);
      setOrderStatus(order.status);
    });

    orderSocketService.onOrderStatusUpdated((data: OrderStatusUpdate) => {
      console.log("Order status updated in hook:", data);
      setOrderStatus(data.status);

      // Use functional update to avoid dependency on currentOrder
      setCurrentOrder((prev) => {
        if (prev && prev.id === data.orderId) {
          return { ...prev, status: data.status };
        }
        return prev;
      });
    });

    orderSocketService.onDriverAssigned((data: any) => {
      console.log("Driver assigned in hook:", data);
      console.log("Driver assigned event full data:", JSON.stringify(data, null, 2));
      
      setDriverInfo(data.order.driver);
      
      // Set initial driver location if provided
      if (data.location) {
        console.log("Setting initial driver location from driver-assigned:", data.location);
        const initialLocation = {
          latitude: data.location.lat,
          longitude: data.location.lng,
        };
        console.log(initialLocation, "location neeee");
        
        setDriverLocation(initialLocation);
        console.log("Initial driver location set to:", initialLocation);
      } else {
        console.warn("No location data in driver-assigned event");
      }
    });

    orderSocketService.onOrderCancelled((data: any) => {
      console.log("Order cancelled in hook:", data);
      // Use functional update to avoid dependency on currentOrder
      setCurrentOrder((prev) => {
        if (prev && prev.id === data.orderId) {
          setOrderStatus("cancelled");
          return { ...prev, status: "cancelled" };
        }
        return prev;
      });
    });

    orderSocketService.onDriverLocationUpdate((data: DriverLocationUpdate) => {
      console.log("Driver location updated in hook:", data);
      // Update driver location for any order we're tracking
      // Don't require currentOrder since we might just be viewing/tracking an order
      if (data.location) {
        const updatedLocation = {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
        };
        setDriverLocation(updatedLocation);
        console.log("Driver location updated to:", updatedLocation);
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
  }, []); // Remove currentOrder dependency to prevent re-running

  // Connect function
  const connect = useCallback(async (): Promise<boolean> => {
    if (isConnected || isConnecting) {
      return isConnected;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      const connected = await orderSocketService.connect();
      if (connected) {
        setIsConnected(true);
        setConnectionError(null);
      } else {
        setConnectionError("Failed to connect to order service");
      }
      setIsConnecting(false);
      return connected;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Connection failed";
      setConnectionError(errorMessage);
      setIsConnecting(false);
      return false;
    }
  }, [isConnected, isConnecting]);

  // Disconnect function
  const disconnect = useCallback(() => {
    orderSocketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
  }, []);

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
          setCurrentOrder(order);
          setOrderStatus(order.status);
          setDriverInfo(null); // Reset driver info for new order
        }
        return order;
      } catch (error) {
        console.error("Failed to create order in hook:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create order";
        setConnectionError(errorMessage);
        return null;
      }
    },
    [isConnected, connect],
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
  const clearError = useCallback(() => {
    setConnectionError(null);
  }, []);

  // Clear current order function
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
    setOrderStatus(null);
    setDriverInfo(null);
    setDriverLocation(null);
  }, []);

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
    clearError,
    clearCurrentOrder,
  };
};
