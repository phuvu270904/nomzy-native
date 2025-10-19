import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ApiOrder, ordersApi } from "@/api/ordersApi";
import { ThemedText } from "@/components/ThemedText";
import { MapView, MapViewRef } from "@/components/ui/MapView";
import { useDriverSocket } from "@/hooks/useDriverSocket";
import { Ionicons } from "@expo/vector-icons";

type OrderStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "picked_up"
  | "out_for_delivery"
  | "delivered";

export default function DriverTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const {
    updateDriverLocation,
    updateOrderStatus,
    isConnected,
    isConnecting,
    connect,
  } = useDriverSocket();
  const mapRef = useRef<MapViewRef>(null);

  const [orderData, setOrderData] = useState<ApiOrder | null>(null);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>("pending");
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const locationSubscription = useRef<Location.LocationSubscription | null>(
    null,
  );
  const locationUpdateInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ensure socket is connected
  useEffect(() => {
    const ensureConnection = async () => {
      if (!isConnected && !isConnecting) {
        console.log("Driver tracking: Connecting to socket...");
        const connected = await connect();
        if (!connected) {
          console.error("Driver tracking: Failed to connect to socket");
          Alert.alert(
            "Connection Error",
            "Failed to connect to tracking service. Location updates may not work.",
          );
        } else {
          console.log("Driver tracking: Socket connected successfully");
        }
      }
    };

    ensureConnection();
  }, [isConnected, isConnecting, connect]);

  // Fetch order data
  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);
        const order = await ordersApi.getOrderById(parseInt(orderId, 10));
        setOrderData(order);

        // Map API status to our status
        const statusMap: Record<string, OrderStatus> = {
          pending: "pending",
          confirmed: "preparing",
          preparing: "preparing",
          ready_for_pickup: "ready",
          picked_up: "picked_up",
          out_for_delivery: "out_for_delivery",
          delivered: "delivered",
        };
        setCurrentStatus(statusMap[order.status] || "pending");
      } catch (error) {
        console.error("Failed to fetch order:", error);
        Alert.alert("Error", "Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  // Request location permissions and start tracking
  useEffect(() => {
    let mounted = true;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Location permission is required to track delivery",
          );
          return;
        }

        // Get initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (mounted) {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setDriverLocation(newLocation);

          // Share initial location via socket (only if connected)
          if (orderId && isConnected) {
            updateDriverLocation(
              parseInt(orderId, 10),
              newLocation.latitude,
              newLocation.longitude,
            );
            console.log("Driver tracking: Initial location sent");
          } else if (orderId && !isConnected) {
            console.warn(
              "Driver tracking: Initial location not sent, socket not connected. Will retry when connected.",
            );
          }
        }

        // Start watching location for real-time updates
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000, // Update every 3 seconds
            distanceInterval: 10, // Or when moved 10 meters
          },
          (location) => {
            if (mounted) {
              const newLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
              setDriverLocation(newLocation);

              // Update map
              mapRef.current?.updateDriverLocation(
                newLocation.latitude,
                newLocation.longitude,
              );
            }
          },
        );

        // Set up interval to send location updates every 3 seconds
        locationUpdateInterval.current = setInterval(async () => {
          if (!mounted) return;

          try {
            const currentLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });

            const newLocation = {
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
            };

            setDriverLocation(newLocation);

            // Update map
            mapRef.current?.updateDriverLocation(
              newLocation.latitude,
              newLocation.longitude,
            );

            // Share location via socket (only if connected)
            if (orderId && isConnected) {
              updateDriverLocation(
                parseInt(orderId, 10),
                newLocation.latitude,
                newLocation.longitude,
              );
              console.log("Driver tracking: Location update sent via interval");
            } else if (orderId && !isConnected) {
              console.warn(
                "Driver tracking: Cannot update location, socket not connected",
              );
            }
          } catch (error) {
            console.error("Interval location update error:", error);
          }
        }, 3000); // Every 3 seconds
      } catch (error) {
        console.error("Location error:", error);
        Alert.alert("Error", "Failed to access location");
      }
    };

    startLocationTracking();

    return () => {
      mounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, [orderId, updateDriverLocation, isConnected]);

  // Send location update when socket reconnects
  useEffect(() => {
    if (isConnected && driverLocation && orderId) {
      console.log("Driver tracking: Socket connected, sending current location");
      updateDriverLocation(
        parseInt(orderId, 10),
        driverLocation.latitude,
        driverLocation.longitude,
      );
    }
  }, [isConnected, driverLocation, orderId, updateDriverLocation]);

  // Update map when status changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.updateOrderStatus(currentStatus);
    }
  }, [currentStatus]);

  const handleStatusUpdate = (newStatus: OrderStatus) => {
    if (!isConnected) {
      Alert.alert(
        "Connection Error",
        "Cannot update order status. Please check your internet connection.",
      );
      return;
    }

    setCurrentStatus(newStatus);
    if (orderId) {
      updateOrderStatus(parseInt(orderId, 10), newStatus);
    }
    mapRef.current?.updateOrderStatus(newStatus);
  };

  const handleCompletePickup = () => {
    Alert.alert(
      "Confirm Pickup",
      "Have you picked up the order from the restaurant?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => handleStatusUpdate("out_for_delivery"),
        },
      ],
    );
  };

  const handleCompleteDelivery = () => {
    Alert.alert(
      "Confirm Delivery",
      "Have you delivered the order to the customer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            handleStatusUpdate("delivered");
            setTimeout(() => {
              router.replace("/(driver-tabs)");
            }, 2000);
          },
        },
      ],
    );
  };

  const handleBackHome = () => {
    Alert.alert(
      "Leave Delivery",
      "Are you sure you want to leave this delivery screen?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Leave", onPress: () => router.back() },
      ],
    );
  };

  // Get restaurant location from addresses
  const getRestaurantLocation = () => {
    if (!orderData?.restaurant?.addresses) return null;

    const defaultAddress = orderData.restaurant.addresses.find(
      (addr: any) => addr.isDefault,
    );
    const address = defaultAddress || orderData.restaurant.addresses[0];

    if (address?.latitude && address?.longitude) {
      return {
        latitude: parseFloat(address.latitude),
        longitude: parseFloat(address.longitude),
      };
    }
    return null;
  };

  // Get customer location
  const getCustomerLocation = () => {
    if (
      !orderData?.address?.latitude ||
      !orderData?.address?.longitude
    ) {
      return null;
    }

    return {
      latitude: parseFloat(orderData.address.latitude),
      longitude: parseFloat(orderData.address.longitude),
    };
  };

  const restaurantLocation = getRestaurantLocation();
  const customerLocation = getCustomerLocation();

  const getStatusSteps = () => {
    const steps: { status: OrderStatus; label: string; icon: string }[] = [
      { status: "preparing", label: "Preparing", icon: "restaurant" },
      { status: "ready", label: "Ready", icon: "checkmark-circle" },
      { status: "picked_up", label: "Picked Up", icon: "bag-handle" },
      {
        status: "out_for_delivery",
        label: "Delivering",
        icon: "navigate-circle",
      },
      { status: "delivered", label: "Delivered", icon: "checkmark-done" },
    ];
    return steps;
  };

  const getCurrentStepIndex = () => {
    const steps = getStatusSteps();
    return steps.findIndex((step) => step.status === currentStatus);
  };

  const getNextAction = () => {
    if (currentStatus === "delivered") {
      return { label: "Complete", action: () => router.replace("/(driver-tabs)") };
    }
    if (
      currentStatus === "out_for_delivery" ||
      currentStatus === "picked_up"
    ) {
      return { label: "Delivered", action: handleCompleteDelivery };
    }
    if (currentStatus === "ready") {
      return { label: "Picked Up", action: handleCompletePickup };
    }
    return null;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading order details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackHome}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          Delivery #{orderId}
        </ThemedText>
        <View style={styles.headerRight} />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          latitude={driverLocation?.latitude || restaurantLocation?.latitude || 0}
          longitude={
            driverLocation?.longitude || restaurantLocation?.longitude || 0
          }
          driverLocation={driverLocation || undefined}
          restaurantLocation={restaurantLocation || undefined}
          customerLocation={customerLocation || undefined}
          orderStatus={currentStatus}
          showRoute={!!driverLocation}
          style={styles.map}
        />

        {/* Connection Status Alert */}
        {!isConnected && (
          <View style={styles.connectionAlert}>
            <Ionicons name="warning" size={16} color="#FF6B35" />
            <ThemedText style={styles.connectionText}>
              {isConnecting
                ? "Connecting..."
                : "Connection lost - Location updates paused"}
            </ThemedText>
          </View>
        )}

        {/* Status Indicator */}
        <View style={styles.statusIndicator}>
          <View style={styles.statusRow}>
            <ThemedText style={styles.statusText}>
              Status: {currentStatus.replace(/_/g, " ")}
            </ThemedText>
            {isConnected && (
              <View style={styles.connectedDot} />
            )}
          </View>
          <ThemedText style={styles.routeText}>
            {currentStatus === "out_for_delivery" ||
            currentStatus === "picked_up"
              ? "🔴 Route to Customer"
              : "🟠 Route to Restaurant"}
          </ThemedText>
        </View>
      </View>

      {/* Order Info Card */}
      <View style={styles.orderInfoCard}>
        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {getStatusSteps().map((step, index) => {
            const currentIndex = getCurrentStepIndex();
            const isActive = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <View key={step.status} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepIcon,
                    isActive && styles.stepIconActive,
                    isCurrent && styles.stepIconCurrent,
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={isActive ? "#FFFFFF" : "#999999"}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.stepLabel,
                    isActive && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </ThemedText>
              </View>
            );
          })}
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="restaurant" size={20} color="#4CAF50" />
            <View style={styles.detailText}>
              <ThemedText style={styles.detailLabel}>Restaurant</ThemedText>
              <ThemedText style={styles.detailValue}>
                {orderData?.restaurant?.name || "Unknown Restaurant"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#FF6B35" />
            <View style={styles.detailText}>
              <ThemedText style={styles.detailLabel}>Customer</ThemedText>
              <ThemedText style={styles.detailValue}>
                {orderData?.address?.streetAddress}, {orderData?.address?.city}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash" size={20} color="#FFB800" />
            <View style={styles.detailText}>
              <ThemedText style={styles.detailLabel}>
                Payment ({orderData?.paymentMethod})
              </ThemedText>
              <ThemedText style={styles.detailValue}>
                {parseFloat(orderData?.total || "0").toLocaleString("vi-VN")}đ
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Action Button */}
        {nextAction && (
          <Pressable style={styles.actionButton} onPress={nextAction.action}>
            <ThemedText style={styles.actionButtonText}>
              {nextAction.label}
            </ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 100,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  headerRight: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  connectionAlert: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 12,
    borderRadius: 8,
    zIndex: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  connectionText: {
    fontSize: 12,
    color: "#FF6B35",
    marginLeft: 8,
    flex: 1,
    fontWeight: "500",
  },
  statusIndicator: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 12,
    borderRadius: 8,
    zIndex: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 180,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
    marginLeft: 8,
  },
  routeText: {
    fontSize: 11,
    color: "#666666",
  },
  orderInfoCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stepIconActive: {
    backgroundColor: "#4CAF50",
  },
  stepIconCurrent: {
    backgroundColor: "#FF6B35",
  },
  stepLabel: {
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#2E2E2E",
    fontWeight: "600",
  },
  orderDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailText: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginRight: 8,
  },
});
