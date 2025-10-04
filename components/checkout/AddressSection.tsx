import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface Address {
  id: string;
  name: string;
  address: string;
  phone: string;
  isDefault: boolean;
}

interface AddressSectionProps {
  address: Address;
  onChangeAddress?: () => void;
}

export function AddressSection({
  address,
  onChangeAddress,
}: AddressSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Delivery Address</ThemedText>
        <TouchableOpacity onPress={onChangeAddress}>
          <ThemedText style={styles.changeButton}>Change</ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.addressCard}>
        <View style={styles.addressInfo}>
          <ThemedText style={styles.addressName}>{address.name}</ThemedText>
          <ThemedText style={styles.addressText}>{address.address}</ThemedText>
          <ThemedText style={styles.addressPhone}>{address.phone}</ThemedText>
        </View>
        <Ionicons name="location" size={24} color="#4CAF50" />
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
});
