import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";

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

export interface OrderStatusUpdate {
  orderId: number;
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready_for_pickup"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  location?: {
    lat: number;
    lng: number;
  };
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

export class OrderSocketService {
  private socket: Socket | null = null;
  private userId: number | null = null;
  private isConnected = false;

  // Event listeners
  private onNewOrderCallback?: (order: Order) => void;
  private onOrderStatusUpdatedCallback?: (data: OrderStatusUpdate) => void;
  private onDriverAssignedCallback?: (data: any) => void;
  private onOrderCancelledCallback?: (data: any) => void;
  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onErrorCallback?: (error: string) => void;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      // Get user data from AsyncStorage
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const user = JSON.parse(userData);
        // Handle both string and number IDs
        this.userId =
          typeof user.user.id === "string"
            ? parseInt(user.user.id)
            : user.user.id;
        console.log("User ID loaded:", this.userId);
      } else {
        console.log("No user data found in AsyncStorage");
      }
    } catch (error) {
      console.error("Failed to get user data:", error);
      this.userId = null;
    }
  }

  async connect(): Promise<boolean> {
    if (this.isConnected && this.socket) {
      return true;
    }

    try {
      // Always refresh user data before connecting
      await this.init();

      if (!this.userId) {
        // Check if user is authenticated
        const token = await AsyncStorage.getItem("auth_token");
        if (!token) {
          throw new Error("User not authenticated. Please log in first.");
        }
        throw new Error("User ID not found in storage. Please log in again.");
      }

      const socketUrl = getSocketUrl();
      console.log("Connecting to:", `${socketUrl}/orders`);

      this.socket = io(`${socketUrl}/orders`, {
        query: {
          userId: this.userId.toString(),
          role: "user",
        },
        transports: ["websocket", "polling"],
        timeout: 20000,
      });

      return new Promise((resolve) => {
        if (!this.socket) {
          resolve(false);
          return;
        }

        this.socket.on("connect", () => {
          console.log("Connected to order socket");
          this.isConnected = true;
          this.onConnectedCallback?.();
          resolve(true);
        });

        this.socket.on("disconnect", () => {
          console.log("Disconnected from order socket");
          this.isConnected = false;
          this.onDisconnectedCallback?.();
        });

        this.socket.on("connect_error", (error) => {
          console.error("Connection error:", error);
          this.isConnected = false;
          this.onErrorCallback?.(error.message);
          resolve(false);
        });

        this.socket.on("error", (data) => {
          console.error("Socket error:", data);
          this.onErrorCallback?.(data.message);
        });

        // Order event listeners
        this.socket.on("new-order", (data: Order) => {
          console.log("New order received:", data);
          this.onNewOrderCallback?.(data);
        });

        this.socket.on("order-status-updated", (data: OrderStatusUpdate) => {
          console.log("Order status updated:", data);
          this.onOrderStatusUpdatedCallback?.(data);
        });

        this.socket.on("driver-assigned", (data: any) => {
          console.log("Driver assigned:", data);
          this.onDriverAssignedCallback?.(data);
        });

        this.socket.on("order-cancelled", (data: any) => {
          console.log("Order cancelled:", data);
          this.onOrderCancelledCallback?.(data);
        });

        this.socket.on("joined-order-room", (data: { orderId: number }) => {
          console.log("Joined order room:", data.orderId);
        });

        // Set a timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            this.socket?.disconnect();
            resolve(false);
          }
        }, 10000);
      });
    } catch (error) {
      console.error("Failed to connect to socket:", error);
      this.onErrorCallback?.(
        error instanceof Error ? error.message : "Connection failed",
      );
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order | null> {
    try {
      // Get auth token
      const token = await AsyncStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Authentication token not found");
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

      // Join the order room after creating the order
      if (this.isConnected && this.socket) {
        this.joinOrderRoom(order.id);
      }

      return order;
    } catch (error) {
      console.error("Failed to create order:", error);
      this.onErrorCallback?.(
        error instanceof Error ? error.message : "Failed to create order",
      );
      return null;
    }
  }

  joinOrderRoom(orderId: number) {
    if (!this.isConnected || !this.socket) {
      console.error("Socket not connected, cannot join order room");
      return;
    }

    console.log("Joining order room:", orderId);
    this.socket.emit("join-order-room", { orderId });
  }

  // Event listener setters
  onNewOrder(callback: (order: Order) => void) {
    this.onNewOrderCallback = callback;
  }

  onOrderStatusUpdated(callback: (data: OrderStatusUpdate) => void) {
    this.onOrderStatusUpdatedCallback = callback;
  }

  onDriverAssigned(callback: (data: any) => void) {
    this.onDriverAssignedCallback = callback;
  }

  onOrderCancelled(callback: (data: any) => void) {
    this.onOrderCancelledCallback = callback;
  }

  onConnected(callback: () => void) {
    this.onConnectedCallback = callback;
  }

  onDisconnected(callback: () => void) {
    this.onDisconnectedCallback = callback;
  }

  onError(callback: (error: string) => void) {
    this.onErrorCallback = callback;
  }

  // Manual user data refresh
  async refreshUserData(): Promise<boolean> {
    await this.init();
    return this.userId !== null;
  }

  // Getters
  getIsConnected(): boolean {
    return this.isConnected;
  }

  getUserId(): number | null {
    return this.userId;
  }
}

// Export singleton instance
export const orderSocketService = new OrderSocketService();
