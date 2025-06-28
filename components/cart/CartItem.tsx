import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export interface CartItemData {
  id: string;
  name: string;
  image: string;
  quantity: number;
  details: string; // e.g., "1.5 km" or size info
  price: number;
}

interface CartItemProps {
  item: CartItemData;
  onRemove?: (itemId: string) => void;
  onPress?: (item: CartItemData) => void;
}

export function CartItem({ item, onRemove, onPress }: CartItemProps) {
  const handleRemove = () => {
    onRemove?.(item.id);
  };

  const handlePress = () => {
    onPress?.(item);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Food Image */}
        <Image source={{ uri: item.image }} style={styles.foodImage} />

        {/* Item Details */}
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemName}>{item.name}</ThemedText>
          <ThemedText style={styles.itemDetails}>
            {item.quantity} items | {item.details}
          </ThemedText>
          <ThemedText style={styles.itemPrice}>
            ${item.price.toFixed(2)}
          </ThemedText>
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 12,
    color: "#9E9E9E",
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
  removeButton: {
    backgroundColor: "#FF5252",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});
