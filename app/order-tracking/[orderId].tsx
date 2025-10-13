import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { FloatingDriverInfo } from "@/components/driver/FloatingDriverInfo";
import { FloatingOrderInfo } from "@/components/orders/FloatingOrderInfo";
import { MapView } from "@/components/ui/MapView";
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

  // Handle order completion
  useEffect(() => {
    if (orderStatus === "delivered") {
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 3000);
    }
  }, [orderStatus]);

  const handleBackHome = () => {
    router.back();
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

  // Mock locations for demo - in real app these would come from the socket
  const driverLocation = driverInfo
    ? { latitude: 37.7849, longitude: -122.4094 }
    : undefined;
  const customerLocation = { latitude: 37.7749, longitude: -122.4194 };

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
        <TouchableOpacity style={styles.headerRight} activeOpacity={0.7}>
          <Ionicons name="refresh" size={20} color="#666666" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          latitude={customerLocation.latitude}
          longitude={customerLocation.longitude}
          driverLocation={driverLocation}
          customerLocation={customerLocation}
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
});
