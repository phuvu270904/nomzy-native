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
import { UserCoupon, userCouponsApi } from "@/api/userCouponsApi";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { clearCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
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
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const { user, isAuthenticated } = useAuth();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [userCoupons, setUserCoupons] = useState<UserCoupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<UserCoupon | null>(null);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
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

  const fetchUserCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const coupons = await userCouponsApi.getUserCoupons();
      // Filter only claimed coupons that are still valid
      const availableCoupons = coupons.filter(
        (uc) =>
          uc.status === "claimed" &&
          uc.coupon.isActive &&
          new Date(uc.coupon.validUntil) > new Date()
      );
      setUserCoupons(availableCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      Alert.alert("Error", "Failed to load coupons");
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const handleChangeCoupon = async () => {
    await fetchUserCoupons();
    setShowCouponModal(true);
  };

  const handleSelectCoupon = (coupon: UserCoupon | null) => {
    setSelectedCoupon(coupon);
    setShowCouponModal(false);
  };

  const calculateCouponDiscount = (subtotal: number): number => {
    if (!selectedCoupon) return 0;

    const coupon = selectedCoupon.coupon;
    const minOrderAmount = parseFloat(coupon.minOrderAmount);

    // Check if subtotal meets minimum requirement
    if (subtotal < minOrderAmount) return 0;

    let discount = 0;
    if (coupon.type === "percentage") {
      discount = (subtotal * parseFloat(coupon.value)) / 100;
      const maxDiscount = parseFloat(coupon.maxDiscountAmount);
      discount = Math.min(discount, maxDiscount);
    } else {
      discount = parseFloat(coupon.value);
    }

    return discount;
  };

  // Calculate totals (reused from cart screen logic)
  const { subtotal, deliveryFee, couponDiscount, total, itemCount, originalTotal } = useMemo(() => {
    if (!cart?.cartItems) {
      return { subtotal: 0, deliveryFee: 0, couponDiscount: 0, total: 0, itemCount: 0, originalTotal: 0 };
    }

    const subtotal = cart.cartItems.reduce((sum, item) => {
      if (!item.product) return sum;
      const price = item.product.discountPrice
        ? parseFloat(item.product.discountPrice)
        : parseFloat(item.product.price);
      return sum + price * item.quantity;
    }, 0);

    const deliveryFee = subtotal * 0.20; // 20% of subtotal
    const couponDiscount = calculateCouponDiscount(subtotal);
    const total = subtotal + deliveryFee - couponDiscount;
    const itemCount = cart.cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    // Calculate original total (before coupon discount)
    const originalTotal = couponDiscount > 0 ? subtotal + deliveryFee : 0;

    return { subtotal, deliveryFee, couponDiscount, total, itemCount, originalTotal };
  }, [cart?.cartItems, selectedCoupon]);

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
                discount: couponDiscount > 0 ? parseFloat(couponDiscount.toFixed(2)) : undefined,
                total: parseFloat(total.toFixed(2)),
                couponId: selectedCoupon?.couponId,
                paymentMethod: selectedPayment.type,
                notes: "Order placed via mobile app",
              };

              console.log("Creating order with data:", orderData);

              // Create order via REST API
              const response = await apiClient.post("/orders", orderData);
              const createdOrder = response.data;

              // Update coupon status to "used" if a coupon was applied
              if (selectedCoupon) {
                try {
                  await userCouponsApi.updateUserCouponStatus(
                    selectedCoupon.id,
                    "used"
                  );
                } catch (error) {
                  console.error("Failed to update coupon status:", error);
                  // Don't fail the order if coupon update fails
                }
              }

              // Clear cart after successful order placement
              dispatch(clearCart());

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

        {/* Coupon Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Coupon</ThemedText>
            <TouchableOpacity onPress={handleChangeCoupon}>
              <ThemedText style={styles.changeButton}>
                {selectedCoupon ? "Change" : "Apply"}
              </ThemedText>
            </TouchableOpacity>
          </View>
          {selectedCoupon ? (
            <View style={styles.couponCard}>
              <View style={styles.couponInfo}>
                <View style={styles.couponIcon}>
                  <Ionicons name="pricetag" size={20} color="#4CAF50" />
                </View>
                <View style={styles.couponDetails}>
                  <ThemedText style={styles.couponName}>
                    {selectedCoupon.coupon.name}
                  </ThemedText>
                  <ThemedText style={styles.couponCode}>
                    {selectedCoupon.coupon.code}
                  </ThemedText>
                  <ThemedText style={styles.couponDescription}>
                    {selectedCoupon.coupon.description}
                  </ThemedText>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleSelectCoupon(null)}>
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noCouponCard}>
              <Ionicons name="ticket-outline" size={24} color="#CCCCCC" />
              <ThemedText style={styles.noCouponText}>
                No coupon applied
              </ThemedText>
            </View>
          )}
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
              <ThemedText style={styles.priceLabel}>Delivery Fee (20%)</ThemedText>
              <ThemedText style={styles.priceValue}>
                ${deliveryFee.toFixed(2)}
              </ThemedText>
            </View>
            {couponDiscount > 0 && (
              <View style={styles.priceRow}>
                <ThemedText style={styles.discountLabel}>
                  Coupon Discount
                </ThemedText>
                <ThemedText style={styles.discountValue}>
                  -${couponDiscount.toFixed(2)}
                </ThemedText>
              </View>
            )}
            <View style={[styles.priceRow, styles.totalRow]}>
              <ThemedText style={styles.totalLabel}>Total</ThemedText>
              <View style={styles.priceValueContainer}>
                {couponDiscount > 0 && (
                  <ThemedText style={styles.originalPrice}>
                    ${originalTotal.toFixed(2)}
                  </ThemedText>
                )}
                <ThemedText style={styles.totalValue}>
                  ${total.toFixed(2)}
                </ThemedText>
              </View>
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

      {/* Coupon Selection Modal */}
      <Modal
        visible={showCouponModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCouponModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Coupon</ThemedText>
              <TouchableOpacity onPress={() => setShowCouponModal(false)}>
                <Ionicons name="close" size={24} color="#2E2E2E" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {isLoadingCoupons ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <ThemedText style={styles.loadingText}>Loading coupons...</ThemedText>
                </View>
              ) : userCoupons.length === 0 ? (
                <View style={styles.emptyCouponsContainer}>
                  <Ionicons name="ticket-outline" size={64} color="#CCCCCC" />
                  <ThemedText style={styles.emptyCouponsText}>
                    No available coupons
                  </ThemedText>
                  <ThemedText style={styles.emptyCouponsSubtext}>
                    Check back later for exclusive offers!
                  </ThemedText>
                </View>
              ) : (
                <>
                  {/* Option to remove coupon */}
                  {selectedCoupon && (
                    <TouchableOpacity
                      style={[styles.modalCouponCard, styles.removeCouponCard]}
                      onPress={() => handleSelectCoupon(null)}
                    >
                      <View style={styles.modalCouponInfo}>
                        <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                        <View style={styles.modalCouponDetails}>
                          <ThemedText style={styles.modalCouponName}>
                            Don't use coupon
                          </ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                  
                  {userCoupons.map((userCoupon) => {
                    const coupon = userCoupon.coupon;
                    const meetsMinimum = subtotal >= parseFloat(coupon.minOrderAmount);
                    const discount = meetsMinimum ? calculateCouponDiscount(subtotal) : 0;
                    
                    return (
                      <TouchableOpacity
                        key={userCoupon.id}
                        style={[
                          styles.modalCouponCard,
                          selectedCoupon?.id === userCoupon.id && styles.selectedCard,
                          !meetsMinimum && styles.disabledCouponCard,
                        ]}
                        onPress={() => meetsMinimum && handleSelectCoupon(userCoupon)}
                        disabled={!meetsMinimum}
                      >
                        <View style={styles.modalCouponInfo}>
                          <View style={styles.couponIconLarge}>
                            <Ionicons name="pricetag" size={24} color="#4CAF50" />
                          </View>
                          <View style={styles.modalCouponDetails}>
                            <ThemedText style={styles.modalCouponName}>
                              {coupon.name}
                            </ThemedText>
                            <ThemedText style={styles.modalCouponCode}>
                              {coupon.code}
                            </ThemedText>
                            <ThemedText style={styles.modalCouponDescription}>
                              {coupon.description}
                            </ThemedText>
                            <View style={styles.couponValueRow}>
                              <ThemedText style={styles.modalCouponValue}>
                                {coupon.type === "percentage"
                                  ? `${coupon.value}% OFF (Max $${coupon.maxDiscountAmount})`
                                  : `$${coupon.value} OFF`}
                              </ThemedText>
                            </View>
                            {meetsMinimum ? (
                              <ThemedText style={styles.couponSavings}>
                                You save: ${discount.toFixed(2)}
                              </ThemedText>
                            ) : (
                              <ThemedText style={styles.couponMinimum}>
                                Min. order: ${coupon.minOrderAmount}
                              </ThemedText>
                            )}
                          </View>
                        </View>
                        {selectedCoupon?.id === userCoupon.id && (
                          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
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
  priceValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: "#999999",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
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
  discountLabel: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  discountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
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
  // Coupon styles
  couponCard: {
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
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  couponInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  couponIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F9F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  couponDetails: {
    flex: 1,
  },
  couponName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 2,
  },
  couponCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
    letterSpacing: 1,
  },
  couponDescription: {
    fontSize: 12,
    color: "#666666",
  },
  noCouponCard: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  noCouponText: {
    fontSize: 14,
    color: "#999999",
    marginLeft: 8,
  },
  modalCouponCard: {
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
  modalCouponInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  couponIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F9F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  modalCouponDetails: {
    flex: 1,
  },
  modalCouponName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  modalCouponCode: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 6,
    letterSpacing: 1.5,
  },
  modalCouponDescription: {
    fontSize: 13,
    color: "#666666",
    marginBottom: 8,
  },
  couponValueRow: {
    marginBottom: 4,
  },
  modalCouponValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B00",
  },
  couponSavings: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4CAF50",
  },
  couponMinimum: {
    fontSize: 12,
    color: "#FF6B6B",
    fontStyle: "italic",
  },
  disabledCouponCard: {
    opacity: 0.5,
  },
  removeCouponCard: {
    backgroundColor: "#FFF5F5",
    borderColor: "#FFE5E5",
  },
  emptyCouponsContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCouponsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999999",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCouponsSubtext: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 12,
  },
});
