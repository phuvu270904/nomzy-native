import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export const SearchingState = () => {
  const { user } = useAuth();

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
        {user?.user.avatar ? (
          <Image source={{ uri: user.user.avatar }} style={styles.avatarImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
        )}
        <Text style={styles.placeholderText}>
          {user?.user.name || "Driver Avatar"}
        </Text>
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
    height: 150,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e0e0e0",
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
});
