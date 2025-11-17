import { convertApiOrderToDriverHistory, ordersApi } from "@/api/ordersApi";
import {
  OrderHistory,
  OrderRequest,
  OrderRequestPopup,
  SearchingState,
  StatusToggle,
  type HistoryOrder
} from "@/components/driver";
import { useAuth } from "@/hooks";
import { useDriverSocket } from "@/hooks/useDriverSocket";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DriverHomeScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [orderHistory, setOrderHistory] = useState<HistoryOrder[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const { fetchUserProfile } = useAuth();

  // Driver WebSocket hook
  const {
    isOnline,
    setOnline,
    isConnected,
    connectionError,
    currentOrderRequest,
    acceptOrder,
    declineOrder,
    clearError,
    clearOrderRequest,
    currentLocation,
    setCurrentLocation,
  } = useDriverSocket();

  // Group orders by date
  const groupedOrders = orderHistory.reduce(
    (groups, order) => {
      const date = order.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
      return groups;
    },
    {} as { [key: string]: typeof orderHistory },
  );

  const availableDates = Object.keys(groupedOrders).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime(),
  );

  // Online states: 'searching' | 'has_orders'
  const [onlineState, setOnlineState] = useState<"searching" | "has_orders">(
    "searching",
  );

  // Available orders for acceptance (fallback fake data when not connected)
  const [availableOrders] = useState<OrderRequest[]>([
    {
      id: "REQ-001",
      customerName: "Ahmed Atef",
      pickupLocation: "Alexandria Street",
      destination: "El-Ragha Food ResRestaurants",
      duration: "26 min",
      distance: "16.5 km",
      payment: "Cash",
      amount: 120,
      currency: "VND",
      isNew: true,
      orderTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    },
    {
      id: "REQ-002",
      customerName: "Sarah Mohamed",
      pickupLocation: "Downtown Mall",
      destination: "New Cairo Restaurants",
      duration: "18 min",
      distance: "12.3 km",
      payment: "Card",
      amount: 85,
      currency: "VND",
      isNew: false,
      orderTime: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    },
    {
      id: "REQ-003",
      customerName: "Omar Hassan",
      pickupLocation: "City Center Mall",
      destination: "Zamalek District",
      duration: "22 min",
      distance: "14.2 km",
      payment: "Cash",
      amount: 95,
      currency: "VND",
      isNew: false,
      orderTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
  ]);

  // Show connection errors
  useEffect(() => {
    if (connectionError) {
      Alert.alert("Connection Error", connectionError, [
        {
          text: "OK",
          onPress: clearError,
        },
      ]);
    }
  }, [connectionError, clearError]);

  // Fetch driver's order history
  useEffect(() => {
    const fetchDriverOrders = async () => {
      const user = await fetchUserProfile();
      if (!user || user.user.role !== "driver") {
        console.log("User is not a Driver");
        return;
      }
      
      setIsLoadingHistory(true);
      try {
        const orders = await ordersApi.getDriverOrders();
        const historyOrders = orders.map(convertApiOrderToDriverHistory);
        setOrderHistory(historyOrders);
      } catch (error: any) {
        console.error("Failed to fetch driver orders:", error);
        Alert.alert(
          "Error",
          "Failed to load order history. Please try again later.",
        );
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchDriverOrders();
  }, []);

  // Request location permissions and start tracking when driver goes online
  useEffect(() => {
    let mounted = true;

    const startLocationTracking = async () => {
      if (!isOnline) {
        // Stop tracking when offline
        if (locationSubscription.current) {
          locationSubscription.current.remove();
          locationSubscription.current = null;
        }
        setCurrentLocation(null);
        return;
      }

      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Location permission is required when you're online to accept orders",
          );
          // Turn driver offline if permission denied
          setOnline(false);
          return;
        }

        // Get initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (mounted && isOnline) {
          const driverLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(driverLocation);
          console.log("Driver location initialized:", driverLocation);
        }

        // Start watching location
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 50, // Or when moved 50 meters
          },
          (location) => {
            if (mounted && isOnline) {
              const driverLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
              setCurrentLocation(driverLocation);
            }
          },
        );
      } catch (error) {
        console.error("Location error:", error);
        Alert.alert(
          "Location Error",
          "Failed to access your location. Please check your device settings.",
        );
      }
    };

    startLocationTracking();

    return () => {
      mounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, [isOnline, setCurrentLocation, setOnline]);

  // Handle online state changes based on connection status
  useEffect(() => {
    if (isOnline && isConnected) {
      // Start with searching state when online and connected
      setOnlineState("searching");

      // After 3 seconds, show available orders if no real orders come through
      const timer = setTimeout(() => {
        if (!currentOrderRequest) {
          setOnlineState("has_orders");
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, isConnected, currentOrderRequest]);

  const handleStatusChange = async (newStatus: boolean) => {
    await setOnline(newStatus);
  };

  const handleOrderRequestAccept = (orderId: number) => {
    // Pass the current location when accepting order
    acceptOrder(orderId, currentLocation || undefined);
    // Navigate to driver tracking screen
    router.push(`/driver-tracking/${orderId}`);
  };

  const handleOrderRequestDecline = (orderId: number) => {
    declineOrder(orderId);
  };

  const handleOrderRequestTimeout = () => {
    Alert.alert(
      "Order Timeout",
      "The order request has timed out and was automatically declined.",
      [
        {
          text: "OK",
          onPress: clearOrderRequest,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Status Toggle */}
      <StatusToggle isOnline={isOnline} onStatusChange={handleStatusChange} />

      {/* Online Content */}
      {isOnline && (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <SearchingState />
        </ScrollView>
      )}

      {/* Order History - Offline Mode */}
      {!isOnline && (
        <>
          {isLoadingHistory ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B00" />
            </View>
          ) : orderHistory.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="car-sport-outline" size={80} color="#FFE5D3" />
              </View>
              <Text style={styles.emptyStateTitle}>
                Ready to Hit the Road?
              </Text>
              <Text style={styles.emptyStateText}>
                No orders yet. Accept your first trip and start earning!
              </Text>
            </View>
          ) : (
            <OrderHistory
              groupedOrders={groupedOrders}
              availableDates={availableDates}
              scrollViewRef={scrollViewRef}
            />
          )}
        </>
      )}

      {/* Order Request Popup */}
      <OrderRequestPopup
        visible={!!currentOrderRequest}
        orderRequest={currentOrderRequest}
        onAccept={handleOrderRequestAccept}
        onDecline={handleOrderRequestDecline}
        onTimeout={handleOrderRequestTimeout}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFF5EE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#FF6B00",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  emptyStateText: {
    fontSize: 15,
    color: "#757575",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});

export default DriverHomeScreen;
