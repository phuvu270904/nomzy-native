import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CheckoutHeaderProps {
  onBack?: () => void;
}

export function CheckoutHeader({ onBack }: CheckoutHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
      <View style={styles.headerSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
