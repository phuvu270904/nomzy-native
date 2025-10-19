import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiOrder, ordersApi } from "@/api/ordersApi";
import { ThemedText } from "@/components/ThemedText";
import { FloatingDriverInfo } from "@/components/driver/FloatingDriverInfo";
import { FloatingOrderInfo } from "@/components/orders/FloatingOrderInfo";
import { MapView, MapViewRef } from "@/components/ui/MapView";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { useAppSelector } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  
  // Get order tracking data directly from Redux store
  // The socket connection is managed by the searching driver screen
  // Using Redux ensures data persists across navigation without recreating connections
  const {
    isConnected,
    isConnecting,
    connectionError,
    orderStatus,
    driverInfo,
    driverLocation,
  } = useAppSelector((state) => state.orderTracking);

  // Fallback hook for direct navigation to this screen (without going through searching driver)
  // This only provides connection methods, doesn't automatically connect
  const { connect, joinOrderRoom } = useOrderSocket();

  console.log(driverInfo, "driverINFOOO");
  

  const [orderData, setOrderData] = useState<ApiOrder | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const mapRef = useRef<MapViewRef>(null);

  // Fallback connection logic for direct navigation to this screen
  useEffect(() => {
    const handleFallbackConnection = async () => {
      // Only connect if no connection exists and no driver info is available
      // This indicates the user navigated directly here without going through searching driver
      if (!isConnected && !isConnecting && !driverInfo && orderId && !hasJoinedRoom) {
        console.log("Direct navigation detected, establishing fallback connection for order:", orderId);
        
        try {
          const connected = await connect();
          if (connected && orderId) {
            joinOrderRoom(parseInt(orderId, 10));
            setHasJoinedRoom(true);
          }
        } catch (error) {
          console.error("Fallback connection failed:", error);
        }
      }
    };

    handleFallbackConnection();
  }, [isConnected, isConnecting, driverInfo, orderId, hasJoinedRoom, connect, joinOrderRoom]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;

      try {
        setIsLoadingOrder(true);
        const order = await ordersApi.getOrderById(parseInt(orderId, 10));
        setOrderData(order);
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setIsLoadingOrder(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Get restaurant location from addresses
  const getRestaurantLocation = () => {
    if (!orderData?.restaurant?.addresses) return null;

    const defaultAddress = orderData.restaurant.addresses.find(
      (addr) => addr.isDefault,
    );
    const address = defaultAddress || orderData.restaurant.addresses[0];

    if (address?.latitude && address?.longitude) {
      return {
        latitude: parseFloat(address.latitude),
        longitude: parseFloat(address.longitude),
      };
    }
    return null;
  };

  // Get customer location
  const getCustomerLocation = () => {
    if (!orderData?.address?.latitude || !orderData?.address?.longitude) {
      return null;
    }

    return {
      latitude: parseFloat(orderData.address.latitude),
      longitude: parseFloat(orderData.address.longitude),
    };
  };

  const restaurantLocation = getRestaurantLocation();
  const customerLocation = getCustomerLocation();

  // Handle order completion
  useEffect(() => {
    if (orderStatus === "delivered") {
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 3000);
    }
  }, [orderStatus]);

  // Update map when order status changes
  useEffect(() => {
    if (mapRef.current && orderStatus) {
      mapRef.current.updateOrderStatus(orderStatus);
    }
  }, [orderStatus]);

  // Update map when driver location changes
  useEffect(() => {
    if (mapRef.current && driverLocation) {
      mapRef.current.updateDriverLocation(
        driverLocation.latitude,
        driverLocation.longitude,
      );
    }
  }, [driverLocation]);

  const handleBackHome = () => {
    router.back();
  };

  if (isLoadingOrder) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>
            Loading order details...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const getEstimatedTime = () => {
    if (orderStatus === "delivered") {
      return "Order Delivered!";
    }
    if (orderStatus === "cancelled") {
      return "Order Cancelled";
    }
    if (orderData?.estimatedDeliveryTime) {
      return `Estimated delivery: ${orderData.estimatedDeliveryTime}`;
    }
    return "Estimated delivery: 25-35 minutes";
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackHome}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order Tracking</ThemedText>
        <View style={styles.headerRight} />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          latitude={
            customerLocation?.latitude ||
            restaurantLocation?.latitude ||
            37.7749
          }
          longitude={
            customerLocation?.longitude ||
            restaurantLocation?.longitude ||
            -122.4194
          }
          driverLocation={driverLocation || undefined}
          restaurantLocation={restaurantLocation || undefined}
          customerLocation={customerLocation || undefined}
          orderStatus={
            (orderStatus as
              | "pending"
              | "preparing"
              | "ready"
              | "picked_up"
              | "out_for_delivery"
              | "delivered") || "pending"
          }
          showRoute={!!driverLocation}
          style={styles.map}
        />

        {/* Connection Status Overlay */}
        {!isConnected && (
          <View style={styles.connectionAlert}>
            <Ionicons name="warning" size={16} color="#FF6B35" />
            <ThemedText style={styles.connectionText}>
              {isConnecting
                ? "Reconnecting..."
                : connectionError || "Connection lost - Updates may be delayed"}
            </ThemedText>
          </View>
        )}

        {/* Order Status Indicator */}
        <View style={styles.statusIndicator}>
          <ThemedText style={styles.statusText}>
            Status: {orderStatus || "pending"}
          </ThemedText>
          <ThemedText style={styles.routeText}>
            {orderStatus === "out_for_delivery"
              ? "🔴 Route to Customer"
              : "🟠 Route to Restaurant"}
          </ThemedText>
        </View>
      </View>

      {/* Floating Order Info */}
      <FloatingOrderInfo
        orderId={orderId || "N/A"}
        estimatedTime={getEstimatedTime()}
        status={orderStatus || "pending"}
      />

      {/* Floating Driver Info */}
      {driverInfo && (
        <FloatingDriverInfo
          driverInfo={{
            ...driverInfo,
            estimatedArrival: "5-10 min",
            plateNumber: driverInfo.plateNumber || "ABC-123",
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 100,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  headerRight: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  connectionAlert: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    zIndex: 200,
  },
  connectionText: {
    fontSize: 12,
    color: "#FF6B35",
    marginLeft: 8,
    flex: 1,
  },
  statusIndicator: {
    position: "absolute",
    top: 70,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 8,
    zIndex: 200,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  routeText: {
    fontSize: 11,
    color: "#666666",
  },
});
