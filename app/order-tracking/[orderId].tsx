import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiOrder, ordersApi } from "@/api/ordersApi";
import { ThemedText } from "@/components/ThemedText";
import { DriverInfoModal } from "@/components/driver/DriverInfoModal";
import { OrderDetailsModal } from "@/components/orders/OrderDetailsModal";
import { MapView, MapViewRef } from "@/components/ui/MapView";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { useAppSelector } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";

type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "picked_up"
  | "out_for_delivery"
  | "delivered";

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
  const [isDriverModalVisible, setIsDriverModalVisible] = useState(false);
  const [isOrderDetailsModalVisible, setIsOrderDetailsModalVisible] = useState(false);
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

  // Helper functions for progress steps
  const getStatusSteps = () => {
    const steps: { status: OrderStatus; label: string; icon: string }[] = [
      { status: "preparing", label: "Preparing", icon: "restaurant" },
      { status: "ready", label: "Ready", icon: "checkmark-circle" },
      { status: "picked_up", label: "Pickup Up", icon: "bag-handle" },
      {
        status: "out_for_delivery",
        label: "Delivering",
        icon: "navigate-circle",
      },
      { status: "delivered", label: "Delivered", icon: "checkmark-done" },
    ];
    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    const currentStatus = orderStatus as OrderStatus;
    return steps.findIndex((step) => step.status === currentStatus);
  };

  const handleDriverInfoPress = () => {
    setIsDriverModalVisible(true);
  };

  const handleOrderDetailsPress = () => {
    setIsOrderDetailsModalVisible(true);
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
            (orderStatus as OrderStatus) || "pending"
          }
          showRoute={!!driverLocation}
          style={styles.map}
        />

        {/* Connection Status Alert */}
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

        {/* Status Indicator */}
        <View style={styles.statusIndicator}>
          <View style={styles.statusRow}>
            <ThemedText style={styles.statusText}>
              Status: {(orderStatus || "pending").replace(/_/g, " ")}
            </ThemedText>
            {isConnected && (
              <View style={styles.connectedDot} />
            )}
          </View>
          <ThemedText style={styles.routeText}>
            {orderStatus === "out_for_delivery" ||
            orderStatus === "picked_up"
              ? "🔴 Route to Customer"
              : "🟠 Route to Restaurant"}
          </ThemedText>
        </View>
      </View>

      {/* Order Info Card */}
      <View style={styles.orderInfoCard}>
        {/* View Order Details Button */}
        <Pressable style={styles.viewOrderDetailsButton} onPress={handleOrderDetailsPress}>
          <View style={styles.orderDetailsContent}>
            <View style={styles.orderDetailsLeft}>
              <ThemedText style={styles.orderDetailsTitle}>Order #{orderId}</ThemedText>
              <ThemedText style={styles.orderDetailsSubtitle}>
                {orderData?.restaurant?.name || "Restaurant"} • {parseFloat(orderData?.total || "0").toLocaleString("vi-VN")}đ
              </ThemedText>
            </View>
            <View style={styles.orderDetailsRight}>
              <ThemedText style={styles.viewDetailsText}>View Details</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
            </View>
          </View>
        </Pressable>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {getStatusSteps().map((step, index) => {
            const currentIndex = getCurrentStepIndex();
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <View key={step.status} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepIcon,
                    isActive && styles.stepIconActive,
                    isCurrent && styles.stepIconCurrent,
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={isActive ? "#FFFFFF" : "#999999"}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {/* Driver Info Section - Only show when driver is assigned */}
        {driverInfo && (
          <Pressable style={styles.driverInfoSection} onPress={handleDriverInfoPress}>
            <View style={styles.driverInfoHeader}>
              <ThemedText style={styles.driverInfoTitle}>Your Driver</ThemedText>
              <Ionicons name="chevron-forward" size={20} color="#666666" />
            </View>
            
            <View style={styles.driverInfoContent}>
              <View style={styles.driverAvatar}>
                {driverInfo?.photo ? (
                  <Image
                    source={{ uri: driverInfo.photo }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={24} color="#4CAF50" />
                  </View>
                )}
              </View>
              
              <View style={styles.driverDetails}>
                <ThemedText style={styles.driverName}>
                  {driverInfo?.name || "Super Driver"}
                </ThemedText>
                <View style={styles.driverMeta}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <ThemedText style={styles.driverRating}>
                    {driverInfo?.rating || "4.8"}
                  </ThemedText>
                  <ThemedText style={styles.driverPlate}>
                    • {driverInfo?.plateNumber || "ABC-123"}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.driverActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="chatbubble" size={18} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="call" size={18} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        )}
      </View>

      {/* Driver Info Modal */}
      {driverInfo && (
        <DriverInfoModal
          visible={isDriverModalVisible}
          onClose={() => setIsDriverModalVisible(false)}
          driverInfo={driverInfo}
        />
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        visible={isOrderDetailsModalVisible}
        onClose={() => setIsOrderDetailsModalVisible(false)}
        orderData={orderData}
      />
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
    zIndex: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  connectionText: {
    fontSize: 12,
    color: "#FF6B35",
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  statusIndicator: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 12,
    borderRadius: 8,
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 180,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  routeText: {
    fontSize: 11,
    color: "#666666",
  },
  orderInfoCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  viewOrderDetailsButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  orderDetailsContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDetailsLeft: {
    flex: 1,
  },
  orderDetailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  orderDetailsSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  orderDetailsRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
    marginRight: 4,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepIconActive: {
    backgroundColor: "#4CAF50",
  },
  stepIconCurrent: {
    backgroundColor: "#FF6B35",
  },
  stepLabel: {
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#2E2E2E",
    fontWeight: "600",
  },
  driverInfoSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  driverInfoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  driverInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  driverInfoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    marginRight: 12,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverRating: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  driverPlate: {
    fontSize: 12,
    color: "#666666",
  },
  driverActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
});
