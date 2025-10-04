import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface PaymentMethod {
  id: string;
  type: "card" | "cash" | "digital_wallet";
  name: string;
  details: string;
  isDefault: boolean;
}

interface PaymentSectionProps {
  paymentMethod: PaymentMethod;
  onChangePayment?: () => void;
}

export function PaymentSection({
  paymentMethod,
  onChangePayment,
}: PaymentSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Payment Method</ThemedText>
        <TouchableOpacity onPress={onChangePayment}>
          <ThemedText style={styles.changeButton}>Change</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.paymentCard}>
        <View style={styles.paymentInfo}>
          <Ionicons
            name={
              paymentMethod.type === "card"
                ? "card"
                : paymentMethod.type === "cash"
                  ? "cash"
                  : "wallet"
            }
            size={24}
            color="#4CAF50"
          />
          <View style={styles.paymentDetails}>
            <ThemedText style={styles.paymentName}>
              {paymentMethod.name}
            </ThemedText>
            <ThemedText style={styles.paymentDetailsText}>
              {paymentMethod.details}
            </ThemedText>
          </View>
        </View>
        <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
