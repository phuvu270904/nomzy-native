import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CartItem as ApiCartItem } from "@/api/cartApi";
import { CartHeader } from "@/components/cart/CartHeader";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { clearError, fetchCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";

export default function CartsScreen() {
  const dispatch = useAppDispatch();
  const { cart, isLoading, error } = useAppSelector((state) => state.cart);

  // Fetch cart data when component mounts
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Calculate totals from API data
  const { subtotal, deliveryFee, tax, total, itemCount } = useMemo(() => {
    if (!cart?.cartItems) {
      return { subtotal: 0, deliveryFee: 0, tax: 0, total: 0, itemCount: 0 };
    }

    const subtotal = cart.cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice
        ? parseFloat(item.product.discountPrice)
        : parseFloat(item.product.price);
      return sum + price * item.quantity;
    }, 0);

    const deliveryFee = subtotal > 50 ? 0 : 3.99; // Free delivery over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + deliveryFee + tax;
    const itemCount = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return { subtotal, deliveryFee, tax, total, itemCount };
  }, [cart?.cartItems]);

  const handleBack = () => {
    router.back();
  };

  const handleMore = () => {
    console.log("More options pressed");
    // Show action sheet or navigate to cart options
  };

  const handleItemPress = (item: ApiCartItem) => {
    console.log("Item pressed:", item.product.name);
    // Navigate to item details or edit quantity
    // router.push(`/product/${item.productId}`);
  };

  const handleCheckout = () => {
    if (!cart?.cartItems || cart.cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checkout.",
      );
      return;
    }

    console.log("Proceeding to checkout with total:", total);
    // Navigate to checkout screen
    // router.push('/checkout');
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(fetchCart());
  };

  const renderCartItem = ({ item }: { item: ApiCartItem }) => (
    <CartItem item={item} onPress={handleItemPress} />
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>Your cart is empty</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Add some delicious items to get started!
      </ThemedText>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <ThemedText style={styles.errorTitle}>
        Oops! Something went wrong
      </ThemedText>
      <ThemedText style={styles.errorMessage}>{error}</ThemedText>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <ThemedText style={styles.loadingText}>Loading your cart...</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <CartHeader
        onBack={handleBack}
        onMore={handleMore}
        itemCount={itemCount}
      />

      <ThemedView style={styles.content}>
        {isLoading ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : cart?.cartItems && cart.cartItems.length > 0 ? (
          <>
            <FlatList
              data={cart.cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id.toString()}
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF5252",
    marginBottom: 12,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
    marginTop: 16,
  },
});
