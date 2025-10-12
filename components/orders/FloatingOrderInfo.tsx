import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

interface FloatingOrderInfoProps {
  orderId: string;
  estimatedTime: string;
  status: string;
  onViewDetails?: () => void;
}

export function FloatingOrderInfo({
  orderId,
  estimatedTime,
  status,
  onViewDetails,
}: FloatingOrderInfoProps) {
  const getStatusColor = (orderStatus: string) => {
    switch (orderStatus) {
      case "confirmed":
        return "#4CAF50";
      case "preparing":
        return "#FF9800";
      case "ready_for_pickup":
        return "#2196F3";
      case "out_for_delivery":
        return "#9C27B0";
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      default:
        return "#666666";
    }
  };

  const getStatusText = (orderStatus: string) => {
    switch (orderStatus) {
      case "confirmed":
        return "Order Confirmed";
      case "preparing":
        return "Preparing Your Order";
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "out_for_delivery":
        return "Out for Delivery";
      case "delivered":
        return "Order Delivered!";
      case "cancelled":
        return "Order Cancelled";
      default:
        return "Processing Order";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.orderInfo}>
            <ThemedText style={styles.orderIdText}>Order #{orderId}</ThemedText>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(status) },
                ]}
              />
              <ThemedText style={styles.statusText}>
                {getStatusText(status)}
              </ThemedText>
            </View>
          </View>
          {onViewDetails && (
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={onViewDetails}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-up" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color="#666666" />
          <ThemedText style={styles.timeText}>{estimatedTime}</ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderIdText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
  },
  detailsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  timeText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
  },
});
