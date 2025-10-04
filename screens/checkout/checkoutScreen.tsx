import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useAppSelector } from "@/store/store";
import { Ionicons } from "@expo/vector-icons";

interface Address {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: "card" | "cash" | "digital_wallet";
  name: string;
  details: string;
  isDefault: boolean;
}

export default function CheckoutScreen() {
  const { cart } = useAppSelector((state) => state.cart);
  const selectedAddress: Address = {
    id: "1",
    name: "Home",
    address: "123 Main Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    isDefault: true,
  };

  const selectedPayment: PaymentMethod = {
    id: "1",
    type: "card",
    name: "Credit Card",
    details: "**** **** **** 1234",
    isDefault: true,
  };

  // Calculate totals (reused from cart screen logic)
  const { subtotal, deliveryFee, tax, total, itemCount } = useMemo(() => {
    if (!cart?.cartItems) {
      return { subtotal: 0, deliveryFee: 0, tax: 0, total: 0, itemCount: 0 };
    }

    const subtotal = cart.cartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = item.product.discountPrice
        ? parseFloat(item.product.discountPrice)
        : parseFloat(item.product.price);
      return sum + price * item.quantity;
    }, 0);

    const deliveryFee = subtotal > 50 ? 0 : 3.99;
    const tax = subtotal * 0.08;
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

  const handlePlaceOrder = () => {
    Alert.alert(
      "Place Order",
      `Your order total is $${total.toFixed(2)}. Confirm to place order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            // TODO: Implement order placement logic
            Alert.alert("Success", "Order placed successfully!");
            router.push("/searching-driver/" as any);
          },
        },
      ],
    );
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderItem}>
      <View style={styles.orderItemInfo}>
        <ThemedText style={styles.orderItemName}>
          {item.product.name}
        </ThemedText>
        <ThemedText style={styles.orderItemDetails}>
          Qty: {item.quantity} × $
          {item.product.discountPrice || item.product.price}
        </ThemedText>
      </View>
      <ThemedText style={styles.orderItemPrice}>
        $
        {(
          (parseFloat(item.product.discountPrice) ||
            parseFloat(item.product.price)) * item.quantity
        ).toFixed(2)}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Delivery Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Delivery Address
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.changeButton}>Change</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <View style={styles.addressInfo}>
              <ThemedText style={styles.addressName}>
                {selectedAddress.name}
              </ThemedText>
              <ThemedText style={styles.addressText}>
                {selectedAddress.address}
              </ThemedText>
              <ThemedText style={styles.addressPhone}>
                {selectedAddress.phone}
              </ThemedText>
            </View>
            <Ionicons name="location" size={24} color="#4CAF50" />
          </View>
        </View>

        {/* Order Summary Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
          <View style={styles.orderSummaryCard}>
            {cart?.cartItems && (
              <FlatList
                data={cart.cartItems}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            )}
          </View>
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.changeButton}>Change</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <Ionicons
                name={
                  selectedPayment.type === "card"
                    ? "card"
                    : selectedPayment.type === "cash"
                      ? "cash"
                      : "wallet"
                }
                size={24}
                color="#4CAF50"
              />
              <View style={styles.paymentDetails}>
                <ThemedText style={styles.paymentName}>
                  {selectedPayment.name}
                </ThemedText>
                <ThemedText style={styles.paymentDetailsText}>
                  {selectedPayment.details}
                </ThemedText>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Price Details</ThemedText>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <ThemedText style={styles.priceLabel}>
                Subtotal ({itemCount} items)
              </ThemedText>
              <ThemedText style={styles.priceValue}>
                ${subtotal.toFixed(2)}
              </ThemedText>
            </View>
            <View style={styles.priceRow}>
              <ThemedText style={styles.priceLabel}>Delivery Fee</ThemedText>
              <ThemedText style={styles.priceValue}>
                {deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}
              </ThemedText>
            </View>
            <View style={styles.priceRow}>
              <ThemedText style={styles.priceLabel}>Tax</ThemedText>
              <ThemedText style={styles.priceValue}>
                ${tax.toFixed(2)}
              </ThemedText>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <ThemedText style={styles.totalValue}>
                ${total.toFixed(2)}
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.placeOrderText}>
            Place Order • ${total.toFixed(2)}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  changeButton: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4CAF50",
  },
  addressCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: "#666666",
  },
  orderSummaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 2,
  },
  orderItemDetails: {
    fontSize: 12,
    color: "#666666",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentDetails: {
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 2,
  },
  paymentDetailsText: {
    fontSize: 14,
    color: "#666666",
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666666",
  },
  priceValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E2E2E",
  },
  bottomSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  placeOrderButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
