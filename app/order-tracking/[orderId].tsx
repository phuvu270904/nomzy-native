import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { DriverInfoCard } from "@/components/driver/DriverInfoCard";
import { OrderStatusTracker } from "@/components/orders/OrderStatusTracker";
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
    currentOrder,
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
    router.replace("/(tabs)");
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
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.orderInfoSection}>
          <ThemedText style={styles.orderIdText}>Order #{orderId}</ThemedText>
          <ThemedText style={styles.estimatedTime}>
            {orderStatus === "delivered"
              ? "Order Delivered!"
              : orderStatus === "cancelled"
                ? "Order Cancelled"
                : "Estimated delivery: 25-35 minutes"}
          </ThemedText>
        </View>

        {/* Driver Info Card */}
        {driverInfo && (
          <DriverInfoCard
            driverInfo={driverInfo}
            style={styles.driverCardMargin}
          />
        )}

        {/* Order Status Progress */}
        <OrderStatusTracker currentStatus={orderStatus} />

        {/* Connection Status */}
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

        {/* Order Details */}
        {currentOrder && (
          <View style={styles.orderDetailsSection}>
            <ThemedText style={styles.sectionTitle}>Order Details</ThemedText>
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>
                  Total Amount:
                </ThemedText>
                <ThemedText style={styles.detailValue}>
                  ${currentOrder.total?.toFixed(2) || "0.00"}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>
                  Order Status:
                </ThemedText>
                <ThemedText style={styles.detailValue}>
                  {currentOrder.status?.replace("_", " ").toUpperCase() ||
                    "PENDING"}
                </ThemedText>
              </View>
              <View style={styles.detailRow}>
                <ThemedText style={styles.detailLabel}>Created At:</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {currentOrder.createdAt
                    ? new Date(currentOrder.createdAt).toLocaleString()
                    : "N/A"}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  driverCardMargin: {
    marginVertical: 16,
  },
  orderInfoSection: {
    paddingVertical: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderIdText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  estimatedTime: {
    fontSize: 14,
    color: "#666666",
  },
  driverCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  driverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  driverTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  driverActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
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
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  vehicle: {
    fontSize: 12,
    color: "#999999",
  },
  statusSection: {
    paddingVertical: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 16,
  },
  statusTracker: {
    paddingLeft: 8,
  },
  statusItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  statusLine: {
    alignItems: "center",
    marginRight: 16,
  },
  statusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  statusCircleCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  statusCircleCurrent: {
    backgroundColor: "#FFFFFF",
    borderColor: "#4CAF50",
  },
  statusCirclePending: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CCCCCC",
  },
  statusConnector: {
    width: 2,
    height: 24,
    marginTop: 4,
  },
  statusConnectorCompleted: {
    backgroundColor: "#4CAF50",
  },
  statusConnectorPending: {
    backgroundColor: "#CCCCCC",
  },
  statusLabelContainer: {
    flex: 1,
    paddingTop: 4,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  statusLabelCompleted: {
    color: "#4CAF50",
  },
  statusLabelCurrent: {
    color: "#2E2E2E",
  },
  statusLabelPending: {
    color: "#999999",
  },
  statusTime: {
    fontSize: 12,
    color: "#666666",
  },
  connectionAlert: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  connectionText: {
    fontSize: 12,
    color: "#FF6B35",
    marginLeft: 8,
    flex: 1,
  },
  orderDetailsSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 12,
  },
  orderDetails: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666666",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
  },
});
