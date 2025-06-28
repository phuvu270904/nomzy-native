import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CartHeader } from "@/components/cart/CartHeader";
import { CartItem, CartItemData } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Sample cart data
const sampleCartItems: CartItemData[] = [
  {
    id: "1",
    name: "Mixed Salad Bowl",
    image: "/placeholder.svg?height=60&width=60",
    quantity: 3,
    details: "1.5 km",
    price: 18.0,
  },
  {
    id: "2",
    name: "Dessert Cake - Lemon",
    image: "/placeholder.svg?height=60&width=60",
    quantity: 4,
    details: "2.1 km",
    price: 22.0,
  },
  {
    id: "3",
    name: "Japanese Kumpa",
    image: "/placeholder.svg?height=60&width=60",
    quantity: 2,
    details: "1.8 km",
    price: 25.0,
  },
  {
    id: "4",
    name: "Vegetable Salad",
    image: "/placeholder.svg?height=60&width=60",
    quantity: 5,
    details: "2.8 km",
    price: 20.0,
  },
  {
    id: "5",
    name: "Noodles & Beacon",
    image: "/placeholder.svg?height=60&width=60",
    quantity: 3,
    details: "1.5 km",
    price: 19.0,
  },
];

export default function CartsScreen() {
  const [cartItems, setCartItems] = useState<CartItemData[]>(sampleCartItems);

  // Calculate totals
  const { subtotal, deliveryFee, tax, total } = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
    const deliveryFee = subtotal > 50 ? 0 : 3.99; // Free delivery over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;

    return { subtotal, deliveryFee, tax, total };
  }, [cartItems]);

  const handleBack = () => {
    router.back();
  };

  const handleMore = () => {
    console.log("More options pressed");
    // Show action sheet or navigate to cart options
  };

  const handleRemoveItem = (itemId: string) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;

    Alert.alert(
      "Remove Item",
      `Are you sure you want to remove "${item.name}" from your cart?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setCartItems((prev) => prev.filter((item) => item.id !== itemId));
          },
        },
      ],
    );
  };

  const handleItemPress = (item: CartItemData) => {
    console.log("Item pressed:", item.name);
    // Navigate to item details or edit quantity
    // router.navigate(`/food-details/${item.id}`);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checkout.",
      );
      return;
    }

    console.log("Proceeding to checkout with total:", total);
    // Navigate to checkout screen
    // router.navigate('/checkout');
  };

  const renderCartItem = ({ item }: { item: CartItemData }) => (
    <CartItem
      item={item}
      onRemove={handleRemoveItem}
      onPress={handleItemPress}
    />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>Your cart is empty</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Add some delicious items to get started!
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <CartHeader
        onBack={handleBack}
        onMore={handleMore}
        itemCount={cartItems.length}
      />

      <ThemedView style={styles.content}>
        {cartItems.length > 0 ? (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />

            <CartSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              tax={tax}
              total={total}
              onCheckout={handleCheckout}
            />
          </>
        ) : (
          renderEmptyCart()
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 12,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 24,
  },
});
