import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

interface OrderStatus {
  key: string;
  label: string;
  icon: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  { key: "confirmed", label: "Confirmed", icon: "checkmark-circle" },
  { key: "preparing", label: "Preparing", icon: "restaurant" },
  { key: "ready_for_pickup", label: "Ready for Pickup", icon: "bag" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: "car" },
  { key: "delivered", label: "Delivered", icon: "checkmark-circle" },
  { key: "cancelled", label: "Cancelled", icon: "close-circle" },
];

interface OrderStatusTrackerProps {
  currentStatus: string | null;
  style?: any;
  showTitle?: boolean;
}

export function OrderStatusTracker({
  currentStatus,
  style,
  showTitle = true,
}: OrderStatusTrackerProps) {
  const getStatusIndex = (status: string | null): number => {
    if (!status) return -1;
    return ORDER_STATUSES.findIndex((s) => s.key === status);
  };

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <View style={[styles.statusSection, style]}>
      {showTitle && (
        <ThemedText style={styles.statusTitle}>Order Status</ThemedText>
      )}

      <View style={styles.statusTracker}>
        {ORDER_STATUSES.map((status, index) => {
          const isCompleted = currentStatusIndex >= index;
          const isCurrent = currentStatusIndex === index;
          const isCancelled =
            currentStatus === "cancelled" && status.key === "cancelled";

          // Don't show cancelled in normal flow unless order is actually cancelled
          if (status.key === "cancelled" && currentStatus !== "cancelled") {
            return null;
          }

          return (
            <View key={status.key} style={styles.statusItem}>
              <View style={styles.statusLine}>
                <View
                  style={[
                    styles.statusCircle,
                    isCompleted || isCancelled
                      ? styles.statusCircleCompleted
                      : isCurrent
                        ? styles.statusCircleCurrent
                        : styles.statusCirclePending,
                  ]}
                >
                  <Ionicons
                    name={status.icon as any}
                    size={16}
                    color={
                      isCompleted || isCancelled
                        ? "#FFFFFF"
                        : isCurrent
                          ? "#4CAF50"
                          : "#CCCCCC"
                    }
                  />
                </View>
                {index < ORDER_STATUSES.length - 1 &&
                  status.key !== "cancelled" && (
                    <View
                      style={[
                        styles.statusConnector,
                        isCompleted
                          ? styles.statusConnectorCompleted
                          : styles.statusConnectorPending,
                      ]}
                    />
                  )}
              </View>
              <View style={styles.statusLabelContainer}>
                <ThemedText
                  style={[
                    styles.statusLabel,
                    isCompleted || isCancelled
                      ? styles.statusLabelCompleted
                      : isCurrent
                        ? styles.statusLabelCurrent
                        : styles.statusLabelPending,
                  ]}
                >
                  {status.label}
                </ThemedText>
                {isCurrent && !isCancelled && (
                  <ThemedText style={styles.statusTime}>In progress</ThemedText>
                )}
                {isCompleted && !isCurrent && !isCancelled && (
                  <ThemedText style={styles.statusTime}>Completed</ThemedText>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
