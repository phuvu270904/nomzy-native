import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addressApi, AddressResponse } from "@/api/addressApi";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/store";
import { apiClient } from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";

enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  DIGITAL_WALLET = 'digital_wallet',
}

interface PaymentMethodOption {
  id: string;
  type: PaymentMethod;
  name: string;
  details: string;
  icon: string;
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
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodOption>({
    id: "1",
    type: PaymentMethod.CASH_ON_DELIVERY,
    name: "Cash on Delivery",
    details: "Pay when you receive",
    icon: "cash",
  });

  const paymentOptions: PaymentMethodOption[] = [
    {
      id: "1",
      type: PaymentMethod.CASH_ON_DELIVERY,
      name: "Cash on Delivery",
      details: "Pay when you receive",
      icon: "cash",
    },
    {
      id: "2",
      type: PaymentMethod.CREDIT_CARD,
      name: "Credit Card",
      details: "**** **** **** 1234",
      icon: "card",
    },
    {
      id: "3",
      type: PaymentMethod.DEBIT_CARD,
      name: "Debit Card",
      details: "**** **** **** 5678",
      icon: "card-outline",
    },
    {
      id: "4",
      type: PaymentMethod.DIGITAL_WALLET,
      name: "Digital Wallet",
      details: "Apple Pay, Google Pay",
      icon: "wallet",
    },
  ];

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
        setSelectedAddress(defaultAddress);
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

  const fetchAllAddresses = async () => {
    try {
      const allAddresses = await addressApi.getAllAddresses();
      setAddresses(allAddresses);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      Alert.alert("Error", "Failed to load addresses");
    }
  };

  const handleChangeAddress = async () => {
    await fetchAllAddresses();
    setShowAddressModal(true);
  };

  const handleSelectAddress = (address: AddressResponse) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleChangePayment = () => {
    setShowPaymentModal(true);
  };

  const handleSelectPayment = (payment: PaymentMethodOption) => {
    setSelectedPayment(payment);
    setShowPaymentModal(false);
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
                addressId: selectedAddress.id,
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

              router.push({
                pathname: "/searching-driver/",
                params: { orderId: createdOrder.id.toString() },
              } as any);
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
            <TouchableOpacity onPress={handleChangeAddress}>
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
                  {selectedAddress.label}
                </ThemedText>
                <ThemedText style={styles.addressText}>
                  {selectedAddress.streetAddress}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postalCode}
                </ThemedText>
                <ThemedText style={styles.addressPhone}>
                  {user?.user?.phone_number || "No phone"}
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
            <TouchableOpacity onPress={handleChangePayment}>
              <ThemedText style={styles.changeButton}>Change</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentCard}>
            <View style={styles.paymentInfo}>
              <Ionicons
                name={selectedPayment.icon as any}
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

      {/* Address Selection Modal */}
      <Modal
        visible={showAddressModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddressModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Address</ThemedText>
              <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                <Ionicons name="close" size={24} color="#2E2E2E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.modalAddressCard,
                    selectedAddress?.id === address.id && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectAddress(address)}
                >
                  <View style={styles.modalAddressInfo}>
                    <View style={styles.addressLabelRow}>
                      <ThemedText style={styles.modalAddressLabel}>
                        {address.label}
                      </ThemedText>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <ThemedText style={styles.defaultBadgeText}>Default</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText style={styles.modalAddressText}>
                      {address.streetAddress}
                    </ThemedText>
                    <ThemedText style={styles.modalAddressText}>
                      {address.city}, {address.state} {address.postalCode}
                    </ThemedText>
                    <ThemedText style={styles.modalAddressText}>
                      {address.country}
                    </ThemedText>
                  </View>
                  {selectedAddress?.id === address.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Method Selection Modal */}
      <Modal
        visible={showPaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Payment Method</ThemedText>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#2E2E2E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {paymentOptions.map((payment) => (
                <TouchableOpacity
                  key={payment.id}
                  style={[
                    styles.modalPaymentCard,
                    selectedPayment.id === payment.id && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectPayment(payment)}
                >
                  <View style={styles.modalPaymentInfo}>
                    <Ionicons
                      name={payment.icon as any}
                      size={24}
                      color="#4CAF50"
                    />
                    <View style={styles.modalPaymentDetails}>
                      <ThemedText style={styles.modalPaymentName}>
                        {payment.name}
                      </ThemedText>
                      <ThemedText style={styles.modalPaymentDetailsText}>
                        {payment.details}
                      </ThemedText>
                    </View>
                  </View>
                  {selectedPayment.id === payment.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalAddressCard: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#4CAF50",
    backgroundColor: "#F0F9F0",
  },
  modalAddressInfo: {
    flex: 1,
  },
  addressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalAddressLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalAddressText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  modalPaymentCard: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  modalPaymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalPaymentDetails: {
    marginLeft: 12,
  },
  modalPaymentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 2,
  },
  modalPaymentDetailsText: {
    fontSize: 14,
    color: "#666666",
  },
});
