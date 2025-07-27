import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { OrderRequest, OrderRequestCard } from "./OrderRequestCard";

interface AvailableOrdersProps {
  orders: OrderRequest[];
  onAcceptOrder: (orderId: string) => void;
  onDeclineOrder: (orderId: string) => void;
}

export const AvailableOrders = ({
  orders,
  onAcceptOrder,
  onDeclineOrder,
}: AvailableOrdersProps) => {
  return (
    <View style={styles.ordersContainer}>
      <Text style={styles.ordersTitle}>Available Orders</Text>
      {orders.map((order) => (
        <OrderRequestCard
          key={order.id}
          order={order}
          onAccept={onAcceptOrder}
          onDecline={onDeclineOrder}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  ordersContainer: {
    padding: 20,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
});
