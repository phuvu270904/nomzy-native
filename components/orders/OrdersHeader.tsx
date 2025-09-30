import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface OrdersHeaderProps {
  title?: string;
  onSearchPress?: () => void;
  onMorePress?: () => void;
}

const OrdersHeader: React.FC<OrdersHeaderProps> = ({
  title = "Orders",
  onSearchPress,
  onMorePress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        {onSearchPress && (
          <TouchableOpacity style={styles.actionButton} onPress={onSearchPress}>
            <Ionicons name="search-outline" size={24} color="#212121" />
          </TouchableOpacity>
        )}
        {onMorePress && (
          <TouchableOpacity style={styles.actionButton} onPress={onMorePress}>
            <Ionicons name="ellipsis-vertical" size={24} color="#212121" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
});

export default OrdersHeader;
