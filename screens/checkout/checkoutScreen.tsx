import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addressApi } from "@/api/addressApi";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/store";
import { apiClient } from "@/utils/apiClient";
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
  type: "credit_card" | "cash_on_delivery" | "digital_wallet";
  name: string;
  details: string;
  isDefault: boolean;
}

interface CreateOrderRequest {
  userId: number;
  restaurantId: number;
  addressId: number;
  orderItems: {
    productId: number;
    quantity: number;
    unitPrice: number;
    discount?: number;
    subtotal: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  total: number;
  couponId?: number;
  paymentMethod: string;
  notes?: string;
}

export default function CheckoutScreen() {
  const { cart } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);

  // Fetch default address on component mount
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (!isAuthenticated) {
        setIsLoadingAddress(false);
        return;
      }

      try {
        setIsLoadingAddress(true);
        const defaultAddress = await addressApi.getDefaultAddress();
        
        // Convert API response to local Address format
        const formattedAddress: Address = {
          id: defaultAddress.id.toString(),
          name: defaultAddress.label,
          address: `${defaultAddress.streetAddress}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.postalCode}`,
          phone: user?.user?.phone_number || "",
          isDefault: defaultAddress.isDefault,
        };
        
        setSelectedAddress(formattedAddress);
      } catch (error) {
        console.error("Error fetching default address:", error);
        Alert.alert(
          "Address Error",
          "Failed to load default address. Please add an address in your profile.",
        );
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchDefaultAddress();
  }, [isAuthenticated, user]);

  const selectedPayment: PaymentMethod = {
    id: "1",
    type: "credit_card",
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

  const handlePlaceOrder = async () => {
    if (
      !isAuthenticated ||
      !user ||
      !cart?.cartItems ||
      cart.cartItems.length === 0
    ) {
      Alert.alert(
        "Error",
        "Please ensure you are logged in and have items in your cart.",
      );
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        "Error",
        "Please select a delivery address before placing the order.",
      );
      return;
    }

    Alert.alert(
      "Place Order",
      `Your order total is $${total.toFixed(2)}. Confirm to place order?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setIsPlacingOrder(true);

            try {
              // Prepare order data
              const orderItems = cart.cartItems.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: parseFloat(
                  item.product.discountPrice || item.product.price,
                ),
                subtotal:
                  parseFloat(item.product.discountPrice || item.product.price) *
                  item.quantity,
              }));

              // Get restaurant ID from first cart item
              const restaurantId =
                cart.cartItems[0]?.product?.restaurantId || 1;

              const orderData: CreateOrderRequest = {
                userId: parseInt(user.user.id),
                restaurantId,
                addressId: parseInt(selectedAddress.id),
                orderItems,
                subtotal: parseFloat(subtotal.toFixed(2)),
                deliveryFee: parseFloat(deliveryFee.toFixed(2)),
                total: parseFloat(total.toFixed(2)),
                paymentMethod: selectedPayment.type,
                notes: "Order placed via mobile app",
              };

              console.log("Creating order with data:", orderData);

              // Create order via REST API
              const response = await apiClient.post("/orders", orderData);
              const createdOrder = response.data;

              if (createdOrder) {
                Alert.alert("Success", "Order placed successfully!", [
                  {
                    text: "OK",
                    onPress: () => {
                      // Pass the order ID to the driver search screen
                      router.push({
                        pathname: "/searching-driver/",
                        params: { orderId: createdOrder.id.toString() },
                      } as any);
                    },
                  },
                ]);
              } else {
                throw new Error("Failed to create order");
              }
            } catch (error) {
              console.error("Error placing order:", error);
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Failed to place order";
              Alert.alert("Error", `Failed to place order: ${errorMessage}`);
            } finally {
              setIsPlacingOrder(false);
            }
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
          {isLoadingAddress ? (
            <View style={[styles.addressCard, styles.loadingCard]}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <ThemedText style={styles.loadingText}>
                Loading address...
              </ThemedText>
            </View>
          ) : selectedAddress ? (
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
          ) : (
            <View style={[styles.addressCard, styles.emptyCard]}>
              <View style={styles.addressInfo}>
                <ThemedText style={styles.emptyText}>
                  No default address found
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Please add a delivery address in your profile
                </ThemedText>
              </View>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
            </View>
          )}
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
                  selectedPayment.type === "credit_card"
                    ? "card"
                    : selectedPayment.type === "cash_on_delivery"
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
          {isPlacingOrder ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <ThemedText style={styles.placeOrderText}>
                Placing Order...
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.placeOrderText}>
              Place Order • ${total.toFixed(2)}
            </ThemedText>
          )}
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
  },
  emptyCard: {
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#666666",
  },
});
