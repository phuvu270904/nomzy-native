import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
    Alert,
    Linking,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";

interface DriverInfoCardProps {
  driverInfo: {
    id?: string | number;
    name?: string;
    rating?: number | string;
    vehicle?: string;
    phone?: string;
    photo?: string;
  };
  showActions?: boolean;
  style?: any;
}

export function DriverInfoCard({
  driverInfo,
  showActions = true,
  style,
}: DriverInfoCardProps) {
  const handleCall = () => {
    if (driverInfo?.phone) {
      Linking.openURL(`tel:${driverInfo.phone}`);
    } else {
      Alert.alert("Call unavailable", "Driver phone number not available");
    }
  };

  const handleMessage = () => {
    // Navigate to message screen with driver
    router.push(`/(tabs)/message?driverId=${driverInfo?.id}`);
  };

  return (
    <View style={[styles.driverCard, style]}>
      <View style={styles.driverHeader}>
        <ThemedText style={styles.driverTitle}>Your Driver</ThemedText>
        {showActions && (
          <View style={styles.driverActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMessage}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble" size={20} color="#4CAF50" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <Ionicons name="call" size={20} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.driverInfo}>
        <View style={styles.driverImageContainer}>
          {driverInfo?.photo ? (
            <img
              src={driverInfo.photo}
              style={styles.driverImage}
              alt="Driver"
            />
          ) : (
            <Ionicons name="person" size={32} color="#4CAF50" />
          )}
        </View>
        <View style={styles.driverDetails}>
          <ThemedText style={styles.driverName}>
            {driverInfo?.name || "Driver"}
          </ThemedText>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <ThemedText style={styles.rating}>
              {driverInfo?.rating || "4.8"}
            </ThemedText>
          </View>
          <ThemedText style={styles.vehicle}>
            {driverInfo?.vehicle || "Vehicle info not available"}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  driverCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  driverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  driverTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  driverActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  driverImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  vehicle: {
    fontSize: 12,
    color: "#999999",
  },
});
