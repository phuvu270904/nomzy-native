import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

interface CartHeaderProps {
  onBack?: () => void;
  onMore?: () => void;
  itemCount?: number;
}

export function CartHeader({ onBack, onMore, itemCount = 0 }: CartHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
      </TouchableOpacity>

      <View style={styles.titleContainer}>
        <ThemedText style={styles.title}>My Cart</ThemedText>
        {itemCount > 0 && (
          <ThemedText style={styles.itemCount}>({itemCount} items)</ThemedText>
        )}
      </View>

      <TouchableOpacity
        style={styles.moreButton}
        onPress={onMore}
        activeOpacity={0.7}
      >
        <Ionicons name="ellipsis-horizontal" size={24} color="#2E2E2E" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
  },
  itemCount: {
    fontSize: 12,
    color: "#9E9E9E",
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});
