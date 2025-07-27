import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface HistoryOrder {
  id: string;
  status: string;
  time: string;
  restaurant: string;
  customerAddress: string;
  earnings: number;
  date: string;
}

interface HistoryOrderCardProps {
  order: HistoryOrder;
}

export const HistoryOrderCard = ({ order }: HistoryOrderCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "active":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  return (
    <View style={styles.historyOrderCard}>
      {/* First Row - Status and Time */}
      <View style={styles.orderFirstRow}>
        <Text
          style={[styles.orderStatus, { color: getStatusColor(order.status) }]}
        >
          {order.status}
        </Text>
        <Text style={styles.orderTime}>{order.time}</Text>
      </View>

      {/* Second Row - Restaurant and Customer Address */}
      <View style={styles.orderSecondRow}>
        <View style={styles.addressRow}>
          <View style={[styles.bullet, { backgroundColor: "#2196F3" }]} />
          <Text style={styles.addressText}>{order.restaurant}</Text>
        </View>
        <View style={styles.addressRow}>
          <View style={[styles.bullet, { backgroundColor: "#FF9800" }]} />
          <Text style={styles.addressText}>{order.customerAddress}</Text>
        </View>
      </View>

      {/* Third Row - Earnings */}
      <View style={styles.orderThirdRow}>
        <Text style={styles.orderEarnings}>
          {formatCurrency(order.earnings)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  historyOrderCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#E0E0E0",
  },
  orderFirstRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderStatus: {
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  orderTime: {
    fontSize: 15,
    color: "#666",
    fontWeight: "700",
  },
  orderSecondRow: {
    marginBottom: 12,
    gap: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  orderThirdRow: {
    alignItems: "flex-end",
  },
  orderEarnings: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
