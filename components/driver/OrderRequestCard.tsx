import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface OrderRequest {
  id: string;
  customerName: string;
  pickupLocation: string;
  destination: string;
  duration: string;
  distance: string;
  payment: string;
  amount: number;
  currency: string;
  isNew: boolean;
  orderTime: Date;
}

interface OrderRequestCardProps {
  order: OrderRequest;
  onAccept: (orderId: string) => void;
  onDecline: (orderId: string) => void;
}

export const OrderRequestCard = ({
  order,
  onAccept,
  onDecline,
}: OrderRequestCardProps) => {
  const getTimePassedSince = (orderTime: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <View style={styles.orderRequestCard}>
      {order.isNew ? (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      ) : (
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>
            {getTimePassedSince(order.orderTime)}
          </Text>
        </View>
      )}

      <View style={styles.orderRequestHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
          <Text style={styles.customerName}>{order.customerName}</Text>
        </View>
        <View style={styles.orderTiming}>
          <Text style={styles.duration}>{order.duration}</Text>
          <Text style={styles.distance}>{order.distance}</Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <View style={styles.greenDot} />
            <Text style={styles.routeText}>{order.pickupLocation}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={styles.orangeDot} />
            <Text style={styles.routeText}>{order.destination}</Text>
          </View>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>
            {order.amount} {order.currency}
          </Text>
          <Text style={styles.paymentMethod}>{order.payment}</Text>
        </View>
      </View>

      <View style={styles.orderRequestFooter}>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => onDecline(order.id)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => onAccept(order.id)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  orderRequestCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  newBadge: {
    position: "absolute",
    top: -10,
    right: 12,
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  timeBadge: {
    position: "absolute",
    top: -10,
    right: 12,
    backgroundColor: "#666",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  timeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  orderRequestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  orderTiming: {
    alignItems: "flex-end",
  },
  duration: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  distance: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  routeContainer: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  routeInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    marginRight: 12,
  },
  orangeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF9800",
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#DDD",
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  paymentMethod: {
    fontSize: 15,
    color: "#666",
    marginTop: 2,
  },
  orderRequestFooter: {
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  declineButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    alignItems: "center",
  },
  declineButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 25,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flex: 1,
    alignItems: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
