import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

interface OrderCardProps {
  order: Order;
  onPress?: () => void;
  onTrackOrder?: () => void;
  onCancelOrder?: () => void;
  onReorder?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onTrackOrder,
  onCancelOrder,
  onReorder,
}) => {
  const getStatusColor = () => {
    switch (order.status) {
      case "active":
        return "#1BAC4B";
      case "completed":
        return "#1BAC4B";
      case "cancelled":
        return "#FF4444";
      default:
        return "#666";
    }
  };

  const getStatusText = () => {
    switch (order.status) {
      case "active":
        return order.estimatedTime
          ? `Ready in ${order.estimatedTime}`
          : "In Progress";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Image
          source={{ uri: order.restaurantImage }}
          style={styles.restaurantImage}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.restaurantName}>{order.restaurantName}</Text>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{order.orderDate}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
        >
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <Text style={styles.itemsTitle}>Items:</Text>
        <Text style={styles.itemsList} numberOfLines={2}>
          {order.items.join(", ")}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.total}>Total: ${order.total.toFixed(2)}</Text>

        <View style={styles.actions}>
          {order.status === "active" && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onTrackOrder}
              >
                <Text style={styles.actionButtonText}>Track Order</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onCancelOrder}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {order.status === "completed" && (
            <TouchableOpacity style={styles.actionButton} onPress={onReorder}>
              <Text style={styles.actionButtonText}>Reorder</Text>
            </TouchableOpacity>
          )}

          {order.status === "cancelled" && (
            <TouchableOpacity style={styles.actionButton} onPress={onReorder}>
              <Text style={styles.actionButtonText}>Order Again</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F5F5F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  restaurantImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 14,
    color: "#1BAC4B",
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: "#757575",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  itemsList: {
    fontSize: 14,
    color: "#757575",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1BAC4B",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    backgroundColor: "#1BAC4B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF4444",
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF4444",
  },
});

export default OrderCard;
