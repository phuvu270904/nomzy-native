import { apiClient } from "@/utils/apiClient";

// Import Order interface from the component
export interface Order {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  items: string[];
  total: number;
  status: "active" | "completed" | "cancelled";
  orderDate: string;
  estimatedTime?: string;
  orderNumber: string;
}

// Types based on API response structure
export interface RestaurantAddress {
  id: number;
  restaurantId: number;
  streetAddress: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  isDefault: boolean;
  label: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: number;
  name: string;
  gender?: string;
  email: string;
  password: string;
  phone_number: string;
  avatar: string;
  role: string;
  refresh_token: string;
  resetToken?: string;
  createdAt: string;
  updatedAt: string;
  addresses?: RestaurantAddress[];
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  discount: string;
  subtotal: string;
  createdAt: string;
  updatedAt: string;
  product: {
    id: number;
    name: string;
  };
}

export interface Address {
  id: number;
  userId: number;
  streetAddress: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  isDefault: boolean;
  label: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrder {
  id: number;
  userId: number;
  restaurantId: number;
  driverId?: number;
  subtotal: string;
  deliveryFee: string;
  discount: string;
  total: string;
  couponId?: number;
  addressId: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  notes?: string;
  estimatedDeliveryTime?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  restaurant: Restaurant;
  driver?: Driver;
  orderItems: OrderItem[];
  address: Address;
}

export type OrderStatus = "active" | "completed" | "cancelled" | null;

// Orders API functions
export const ordersApi = {
  // Get user's orders with optional status filter
  getMyOrders: async (status?: OrderStatus): Promise<ApiOrder[]> => {
    const params = status ? { status } : {};
    const response = await apiClient.get<ApiOrder[]>("/orders/my/orders", {
      params,
    });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (orderId: number): Promise<ApiOrder> => {
    const response = await apiClient.get<ApiOrder>(`/orders/${orderId}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: number): Promise<ApiOrder> => {
    const response = await apiClient.patch<ApiOrder>(
      `/orders/${orderId}/cancel`,
    );
    return response.data;
  },
};

// Helper function to convert API order to UI order format
export const convertApiOrderToUIOrder = (apiOrder: ApiOrder): Order => {
  // Map API status to UI status
  const mapStatus = (
    apiStatus: string,
  ): "active" | "completed" | "cancelled" => {
    switch (apiStatus.toLowerCase()) {
      case "pending":
      case "confirmed":
      case "preparing":
      case "on_the_way":
        return "active";
      case "delivered":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return "active";
    }
  };

  // Extract item names from orderItems
  const items = apiOrder.orderItems.map(
    (item) => `${item.quantity}x ${item.product.name}`,
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffInHours < 48) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days ago, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

  return {
    id: apiOrder.id.toString(),
    restaurantName: apiOrder.restaurant.name,
    restaurantImage: apiOrder.restaurant.avatar,
    items,
    total: parseFloat(apiOrder.total),
    status: mapStatus(apiOrder.status),
    orderDate: formatDate(apiOrder.createdAt),
    estimatedTime: apiOrder.estimatedDeliveryTime || "TBD",
    orderNumber: `ORD${apiOrder.id.toString().padStart(3, "0")}`,
  };
};
