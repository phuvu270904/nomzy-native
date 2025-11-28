import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";

interface FloatingDriverInfoProps {
  driverInfo: {
    id?: string | number;
    name?: string;
    rating?: number | string;
    vehicle?: string;
    phone?: string;
    avatar?: string;
    plateNumber?: string;
    estimatedArrival?: string;
  };
  style?: any;
  onPress?: () => void;
}

export function FloatingDriverInfo({
  driverInfo,
  style,
  onPress,
}: FloatingDriverInfoProps) {
  const handleCall = () => {
    if (driverInfo?.phone) {
      Linking.openURL(`tel:${driverInfo.phone}`);
    } else {
      Alert.alert("Call unavailable", "Driver phone number not available");
    }
  };

  const handleMessage = () => {
    // This could navigate to a chat screen or open SMS
    if (driverInfo?.phone) {
      Linking.openURL(`sms:${driverInfo.phone}`);
    } else {
      Alert.alert("Message unavailable", "Driver contact not available");
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable style={styles.content} onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.driverSection}>
            <View style={styles.avatarContainer}>
              {driverInfo?.avatar ? (
                <Image
                  source={{ uri: driverInfo.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#4CAF50" />
                </View>
              )}
            </View>

            <View style={styles.driverDetails}>
              <ThemedText style={styles.driverName}>
                {driverInfo?.name || "Driver"}
              </ThemedText>

              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <ThemedText style={styles.rating}>
                  {driverInfo?.rating || "4.8"}
                </ThemedText>
                <ThemedText style={styles.ratingText}>
                  • {driverInfo?.plateNumber || "ABC-123"}
                </ThemedText>
              </View>

              {driverInfo?.estimatedArrival && (
                <View style={styles.arrivalContainer}>
                  <Ionicons name="time-outline" size={14} color="#666666" />
                  <ThemedText style={styles.arrivalText}>
                    Arrives in {driverInfo.estimatedArrival}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
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
        </View>
        
        {/* Tap to view more indicator */}
        {onPress && (
          <View style={styles.tapIndicator}>
            <ThemedText style={styles.tapText}>Tap for driver details</ThemedText>
            <Ionicons name="chevron-up" size={16} color="#999999" />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666666",
  },
  arrivalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrivalText: {
    fontSize: 12,
    color: "#666666",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F8FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E3F2FD",
  },
  tapIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  tapText: {
    fontSize: 12,
    color: "#999999",
    marginRight: 4,
  },
});
