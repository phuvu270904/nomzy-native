import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  originalTotal?: number; // Original price before discount
  onCheckout?: () => void;
}

export function CartSummary({
  subtotal,
  deliveryFee,
  total,
  originalTotal,
  onCheckout,
}: CartSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.summarySection}>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <ThemedText style={styles.totalLabel}>Total</ThemedText>
          <View style={styles.totalPriceContainer}>
            {originalTotal && originalTotal > total && (
              <ThemedText style={styles.originalTotalValue}>
                ${originalTotal.toFixed(2)}
              </ThemedText>
            )}
            <ThemedText style={styles.totalValue}>${total.toFixed(2)}</ThemedText>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={onCheckout}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.checkoutButtonText}>
          Proceed to Checkout
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E2E2E",
  },
  totalPriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  originalTotalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999999",
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  checkoutButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
