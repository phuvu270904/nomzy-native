import { CartItem as ApiCartItem } from "@/api/cartApi";
import { ThemedText } from "@/components/ThemedText";
import {
  removeCartItemAsync,
  removeItemOptimistic,
  updateCartItemAsync,
  updateQuantityOptimistic,
} from "@/store/slices/cartSlice";
import { useAppDispatch } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface CartItemProps {
  item: ApiCartItem;
  onPress?: (item: ApiCartItem) => void;
}

export function CartItem({ item, onPress }: CartItemProps) {
  const dispatch = useAppDispatch();

  const handleRemove = () => {
    // Optimistic update first for better UX
    dispatch(removeItemOptimistic(item.id));
    // Then sync with backend
    dispatch(removeCartItemAsync(item.id));
  };

  const handlePress = () => {
    onPress?.(item);
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      // Optimistic update first for better UX
      dispatch(
        updateQuantityOptimistic({ itemId: item.id, quantity: newQuantity }),
      );
      // Then sync with backend
      dispatch(updateCartItemAsync({ itemId: item.id, quantity: newQuantity }));
    }
  };

  const handleIncreaseQuantity = () => {
    const newQuantity = item.quantity + 1;
    // Optimistic update first for better UX
    dispatch(
      updateQuantityOptimistic({ itemId: item.id, quantity: newQuantity }),
    );
    // Then sync with backend
    dispatch(updateCartItemAsync({ itemId: item.id, quantity: newQuantity }));
  };

  // Calculate item total price
  const itemTotal = parseFloat(item.price) * item.quantity;
  const hasDiscount =
    item.product.discountPrice &&
    parseFloat(item.product.discountPrice) < parseFloat(item.product.price);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Food Image */}
        <Image
          source={{ uri: item.product.imageUrl }}
          style={styles.foodImage}
        />

        {/* Item Details */}
        <View style={styles.itemInfo}>
          <ThemedText style={styles.itemName}>{item.product.name}</ThemedText>
          <ThemedText style={styles.itemDescription} numberOfLines={2}>
            {item.product.description}
          </ThemedText>

          {/* Price section */}
          <View style={styles.priceSection}>
            {hasDiscount ? (
              <View style={styles.priceContainer}>
                <ThemedText style={styles.originalPrice}>
                  ${parseFloat(item.product.price).toFixed(2)}
                </ThemedText>
                <ThemedText style={styles.discountPrice}>
                  ${parseFloat(item.product.discountPrice!).toFixed(2)}
                </ThemedText>
              </View>
            ) : (
              <ThemedText style={styles.itemPrice}>
                ${parseFloat(item.product.price).toFixed(2)}
              </ThemedText>
            )}
          </View>

          {/* Quantity controls and total */}
          <View style={styles.quantitySection}>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecreaseQuantity}
                disabled={item.quantity <= 1}
              >
                <Ionicons
                  name="remove"
                  size={16}
                  color={item.quantity <= 1 ? "#ccc" : "#666"}
                />
              </TouchableOpacity>

              <ThemedText style={styles.quantityText}>
                {item.quantity}
              </ThemedText>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncreaseQuantity}
              >
                <Ionicons name="add" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <ThemedText style={styles.totalPrice}>
              Total: ${itemTotal.toFixed(2)}
            </ThemedText>
          </View>
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
    alignItems: "flex-start",
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
  itemDescription: {
    fontSize: 12,
    color: "#9E9E9E",
    marginBottom: 8,
    lineHeight: 16,
  },
  priceSection: {
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: "#9E9E9E",
    textDecorationLine: "line-through",
  },
  discountPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 2,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E2E2E",
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },
  totalPrice: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E2E2E",
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
