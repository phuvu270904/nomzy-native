import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const SearchingState = () => {
  return (
    <View style={styles.searchingContainer}>
      <Text style={styles.searchingTitle}>
        Searching for orders, please wait
      </Text>
      <View style={styles.searchingIconContainer}>
        <Ionicons
          name="earth-outline"
          size={120}
          color="#FF6B00"
          style={styles.searchingIcon}
        />
      </View>
      <Text style={styles.searchingSubtitle}>Looking for orders</Text>
      <View style={styles.searchingImagePlaceholder}>
        <Ionicons name="car-outline" size={60} color="#ccc" />
        <Text style={styles.placeholderText}>Driver Image</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  searchingTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 40,
  },
  searchingIconContainer: {
    marginBottom: 30,
  },
  searchingIcon: {
    opacity: 0.8,
  },
  searchingSubtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  searchingImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 30,
    width: 150,
    height: 100,
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
});
