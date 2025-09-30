import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OrdersHeaderProps {
  title?: string;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({ title = "Orders" }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    textAlign: "center",
  },
});

export default OrdersHeader;
