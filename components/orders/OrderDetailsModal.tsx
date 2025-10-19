import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import { ApiOrder } from "@/api/ordersApi";
import { ThemedText } from "@/components/ThemedText";

interface OrderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  orderData: ApiOrder | null;
}

export function OrderDetailsModal({
  visible,
  onClose,
  orderData,
}: OrderDetailsModalProps) {
  if (!orderData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9500";
      case "preparing":
        return "#FF6B35";
      case "ready":
        return "#4CAF50";
      case "picked_up":
        return "#2196F3";
      case "out_for_delivery":
        return "#9C27B0";
      case "delivered":
        return "#4CAF50";
      default:
        return "#999999";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.modalContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Order ID and Status */}
            <View style={styles.orderHeader}>
              <View style={styles.orderIdSection}>
                <ThemedText style={styles.orderIdLabel}>Order ID</ThemedText>
                <ThemedText style={styles.orderIdValue}>#{orderData.id}</ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderData.status) }]}>
                <ThemedText style={styles.statusText}>
                  {orderData.status.replace(/_/g, " ").toUpperCase()}
                </ThemedText>
              </View>
            </View>

            {/* Restaurant Information */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant" size={20} color="#4CAF50" />
                <ThemedText style={styles.sectionTitle}>Restaurant</ThemedText>
              </View>
              <View style={styles.infoCard}>
                <ThemedText style={styles.restaurantName}>
                  {orderData.restaurant?.name || "Unknown Restaurant"}
                </ThemedText>
                {orderData.restaurant?.addresses && orderData.restaurant.addresses.length > 0 && (
                  <ThemedText style={styles.restaurantAddress}>
                    {orderData.restaurant.addresses[0].streetAddress}, {orderData.restaurant.addresses[0].city}
                  </ThemedText>
                )}
              </View>
            </View>

            {/* Delivery Address */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="location" size={20} color="#FF6B35" />
                <ThemedText style={styles.sectionTitle}>Delivery Address</ThemedText>
              </View>
              <View style={styles.infoCard}>
                <ThemedText style={styles.addressText}>
                  {orderData.address?.streetAddress}
                </ThemedText>
                <ThemedText style={styles.addressSubText}>
                  {orderData.address?.city}, {orderData.address?.state} {orderData.address?.postalCode}
                </ThemedText>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="restaurant-outline" size={20} color="#9C27B0" />
                <ThemedText style={styles.sectionTitle}>Order Items</ThemedText>
              </View>
              <View style={styles.infoCard}>
                {orderData.orderItems?.map((orderItem: any, index: number) => (
                  <View key={index} style={styles.orderItem}>
                    <View style={styles.itemDetails}>
                      <ThemedText style={styles.itemName}>{orderItem.product?.name || 'Unknown Item'}</ThemedText>
                      <ThemedText style={styles.itemQuantity}>Qty: {orderItem.quantity}</ThemedText>
                    </View>
                    <ThemedText style={styles.itemPrice}>
                      {parseFloat(orderItem.subtotal || "0").toLocaleString("vi-VN")}đ
                    </ThemedText>
                  </View>
                )) || (
                  <ThemedText style={styles.noItemsText}>No items found</ThemedText>
                )}
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="receipt" size={20} color="#FFB800" />
                <ThemedText style={styles.sectionTitle}>Order Summary</ThemedText>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {parseFloat(orderData.subtotal || "0").toLocaleString("vi-VN")}đ
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Delivery Fee</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {parseFloat(orderData.deliveryFee || "0").toLocaleString("vi-VN")}đ
                  </ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Discount</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    -{parseFloat(orderData.discount || "0").toLocaleString("vi-VN")}đ
                  </ThemedText>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <ThemedText style={styles.totalLabel}>Total</ThemedText>
                  <ThemedText style={styles.totalValue}>
                    {parseFloat(orderData.total || "0").toLocaleString("vi-VN")}đ
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card" size={20} color="#2196F3" />
                <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
              </View>
              <View style={styles.infoCard}>
                <ThemedText style={styles.paymentMethod}>
                  {orderData.paymentMethod || "Cash"}
                </ThemedText>
              </View>
            </View>

            {/* Order Timing */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time" size={20} color="#795548" />
                <ThemedText style={styles.sectionTitle}>Order Timing</ThemedText>
              </View>
              <View style={styles.infoCard}>
                <View style={styles.timingRow}>
                  <ThemedText style={styles.timingLabel}>Order Placed</ThemedText>
                  <ThemedText style={styles.timingValue}>
                    {orderData.createdAt ? new Date(orderData.createdAt).toLocaleString() : "N/A"}
                  </ThemedText>
                </View>
                {orderData.estimatedDeliveryTime && (
                  <View style={styles.timingRow}>
                    <ThemedText style={styles.timingLabel}>Estimated Delivery</ThemedText>
                    <ThemedText style={styles.timingValue}>
                      {orderData.estimatedDeliveryTime}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: "85%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderIdSection: {
    flex: 1,
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  orderIdValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: "#666666",
  },
  addressText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  addressSubText: {
    fontSize: 14,
    color: "#666666",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E8E8",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666666",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  noItemsText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    fontStyle: "italic",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2E2E2E",
  },
  timingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  timingLabel: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  timingValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E2E2E",
    flex: 1,
    textAlign: "right",
  },
});