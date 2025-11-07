import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { Ionicons } from "@expo/vector-icons";

export default function SearchingDriverScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const {
    isConnected,
    isConnecting,
    joinOrderRoom,
    orderStatus,
    driverInfo,
    hasJoinedRoom,
  } = useOrderSocket();

  const [searchProgress, setSearchProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));
  const joinAttempts = useRef(0);
  const maxJoinAttempts = 5;

  // Check if current order room is joined
  const isRoomJoined = orderId ? hasJoinedRoom[parseInt(orderId, 10)] : false;

  useEffect(() => {
    // Join order room once socket is connected
    // No need to manually connect - socket auto-connects on login via TabLayout
    const joinRoom = () => {
      if (!orderId) {
        console.warn("No orderId provided");
        return;
      }

      if (!isConnected) {
        console.log("Socket not connected yet, waiting...");
        return;
      }

      if (isRoomJoined) {
        console.log("Already joined room:", orderId);
        return;
      }

      if (joinAttempts.current >= maxJoinAttempts) {
        console.warn("Max join attempts reached");
        return;
      }

      // Attempt to join the room
      console.log(`Joining order room: ${orderId} (attempt ${joinAttempts.current + 1}/${maxJoinAttempts})`);
      joinOrderRoom(parseInt(orderId, 10));
      joinAttempts.current += 1;
    };

    joinRoom();
  }, [orderId, isConnected, isRoomJoined, joinOrderRoom]);

  // Handle order status updates
  useEffect(() => {
    if (orderStatus) {
      console.log("Order status updated:", orderStatus);

      // Handle different order statuses
      switch (orderStatus) {
        case "confirmed":
          setSearchProgress(25);
          // If we have driver info and confirmed status, navigate to tracking
          if (driverInfo && orderId) {
            setTimeout(() => {
              router.replace(`/order-tracking/${orderId}`);
            }, 1000);
          }
          break;
        case "preparing":
          setSearchProgress(50);
          // Navigate to tracking if we have driver info
          if (driverInfo && orderId) {
            router.replace(`/order-tracking/${orderId}`);
          }
          break;
        case "ready_for_pickup":
          setSearchProgress(75);
          // Navigate to tracking if we have driver info
          if (driverInfo && orderId) {
            router.replace(`/order-tracking/${orderId}`);
          }
          break;
        case "out_for_delivery":
          setSearchProgress(90);
          // Navigate to tracking if we have driver info
          if (driverInfo && orderId) {
            router.replace(`/order-tracking/${orderId}`);
          }
          break;
        case "delivered":
          setSearchProgress(100);
          // Navigate to completion screen
          setTimeout(() => {
            router.replace("/(tabs)");
          }, 2000);
          break;
        default:
          break;
      }
    }
  }, [orderStatus, driverInfo, orderId]);

  // Handle driver assignment
  useEffect(() => {
    if (driverInfo && orderId) {
      console.log("Driver assigned:", driverInfo);
      setSearchProgress(100);
      // Navigate to order tracking screen with driver info
      setTimeout(() => {
        router.replace(`/order-tracking/${orderId}`);
      }, 1500);
    }
  }, [driverInfo, orderId]);

  useEffect(() => {
    // Start fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Create pulsing animation for the search icon
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    // Simulate search progress
    // const progressTimer = setInterval(() => {
    //   setSearchProgress((prev) => {
    //     if (prev >= 100) {
    //       clearInterval(progressTimer);
    //       // Navigate to driver tabs after finding driver
    //       setTimeout(() => {
    //         router.replace("/(tabs)");
    //       }, 1000);
    //       return 100;
    //     }
    //     return prev + 10;
    //   });
    // }, 800);

    return () => {
      //   clearInterval(progressTimer);
      pulseAnimation.stop();
    };
  }, [fadeAnim, scaleAnim]);

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#2E2E2E" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Finding Driver</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Main Search Visual */}
        <View style={styles.searchSection}>
          <Animated.View
            style={[
              styles.searchIconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.searchCircle}>
              <Ionicons name="car-outline" size={80} color="#4CAF50" />
            </View>
          </Animated.View>

          <ThemedText style={styles.searchTitle}>
            {driverInfo ? "Driver Found!" : "Finding nearby drivers"}
          </ThemedText>
          <ThemedText style={styles.searchSubtitle}>
            {driverInfo
              ? `${driverInfo.name} will deliver your order`
              : orderStatus
                ? `Order Status: ${orderStatus.replace("_", " ").toUpperCase()}`
                : "Please wait while we connect you with a driver"}
          </ThemedText>

          {/* Order ID Display */}
          {orderId && (
            <ThemedText style={styles.orderIdText}>Order #{orderId}</ThemedText>
          )}

          {/* Connection Status */}
          {!isConnected && (
            <ThemedText style={styles.connectionStatus}>
              {isConnecting
                ? "Connecting..."
                : "Connection lost - Updates may be delayed"}
            </ThemedText>
          )}

          {/* Driver Search Animation */}
          <View style={styles.driverImageContainer}>
            <View style={styles.driverInfo}>
              <ThemedText style={styles.driverText}>
                Looking for the best driver
              </ThemedText>
              <ThemedText style={styles.driverSubText}>
                ETA: 2-5 minutes
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>
            {searchProgress < 100 ? "Searching..." : "Driver found!"}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Cancel Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.cancelText}>Cancel Search</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  searchSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIconContainer: {
    marginBottom: 32,
  },
  searchCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(76, 175, 80, 0.3)",
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
    textAlign: "center",
    marginBottom: 12,
  },
  searchSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  progressContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  progressBar: {
    width: "80%",
    height: 6,
    backgroundColor: "#F0F0F0",
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  driverImageContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  driverImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  driverInfo: {
    alignItems: "center",
  },
  driverText: {
    fontSize: 16,
    color: "#2E2E2E",
    fontWeight: "500",
    marginBottom: 4,
  },
  driverSubText: {
    fontSize: 14,
    color: "#666666",
  },
  loadingContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#4CAF50",
    marginTop: 12,
    fontWeight: "500",
  },
  orderIdText: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
    textAlign: "center",
  },
  connectionStatus: {
    fontSize: 12,
    color: "#FF6B35",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
});
