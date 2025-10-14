import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { FloatingDriverInfo } from "@/components/driver/FloatingDriverInfo";
import { FloatingOrderInfo } from "@/components/orders/FloatingOrderInfo";
import { MapView, MapViewRef } from "@/components/ui/MapView";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { Ionicons } from "@expo/vector-icons";

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const {
    isConnected,
    isConnecting,
    connect,
    joinOrderRoom,
    orderStatus,
    driverInfo,
  } = useOrderSocket();

  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);
  const mapRef = useRef<MapViewRef>(null);

  useEffect(() => {
    // Initialize socket connection and join order room
    const initializeOrderTracking = async () => {
      try {
        console.log("Initializing order tracking for order:", orderId);

        if (!isConnected && !isConnecting) {
          console.log("Connecting to socket for order tracking...");
          const connected = await connect();
          if (!connected) {
            console.warn("Failed to connect to order tracking service");
            return;
          }
        }

        // Join order room if we have an orderId and haven't joined yet
        if (orderId && isConnected && !hasJoinedRoom) {
          console.log("Joining order room:", orderId);
          joinOrderRoom(parseInt(orderId, 10));
          setHasJoinedRoom(true);
        }
      } catch (error) {
        console.error("Error initializing order tracking:", error);
      }
    };

    initializeOrderTracking();
  }, [
    orderId,
    isConnected,
    isConnecting,
    hasJoinedRoom,
    connect,
    joinOrderRoom,
  ]);

  // Mock locations for demo - in real app these would come from the socket/API
  const driverLocation = { latitude: 37.7849, longitude: -122.4094 }; // Driver location (e.g., Chinatown)

  // Restaurant location (e.g., Chinatown restaurant)
  const restaurantLocation = { latitude: 37.7949, longitude: -122.4034 };

  // Customer delivery location (e.g., Mission District)
  const customerLocation = { latitude: 37.7749, longitude: -122.4194 };

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

  // Simulate driver movement for demo purposes
  useEffect(() => {
    if (!driverLocation || !mapRef.current) return;

    const interval = setInterval(() => {
      // Simulate slight movement for demo
      const newLat = driverLocation.latitude + (Math.random() - 0.5) * 0.001;
      const newLng = driverLocation.longitude + (Math.random() - 0.5) * 0.001;
      mapRef.current?.updateDriverLocation(newLat, newLng);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [driverLocation]);

  const handleBackHome = () => {
    router.back();
  };

  // Debug function to test different order statuses
  const simulateOrderStatusChange = () => {
    const statuses = [
      "pending",
      "preparing",
      "ready",
      "picked_up",
      "out_for_delivery",
    ];
    const currentIndex = statuses.indexOf(orderStatus || "pending");
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    console.log("Simulating order status change to:", nextStatus);
    mapRef.current?.updateOrderStatus(nextStatus);
  };

  const getEstimatedTime = () => {
    if (orderStatus === "delivered") {
      return "Order Delivered!";
    }
    if (orderStatus === "cancelled") {
      return "Order Cancelled";
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
        <TouchableOpacity
          style={styles.headerRight}
          activeOpacity={0.7}
          onPress={simulateOrderStatusChange}
        >
          <Ionicons name="refresh" size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          latitude={customerLocation.latitude}
          longitude={customerLocation.longitude}
          driverLocation={driverLocation}
          restaurantLocation={restaurantLocation}
          customerLocation={customerLocation}
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
                : "Connection lost - Updates may be delayed"}
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
      {true && (
        <FloatingDriverInfo
          driverInfo={{
            ...driverInfo,
            estimatedArrival: "5-10 min",
            plateNumber: "ABC-123",
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
    padding: 8,
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
