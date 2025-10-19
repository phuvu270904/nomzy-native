import {
  OrderHistory,
  OrderRequestPopup,
  SearchingState,
  StatusToggle,
  type HistoryOrder,
  type OrderRequest,
} from "@/components/driver";
import { useDriverSocket } from "@/hooks/useDriverSocket";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const fakeHistory: HistoryOrder[] = [
  // Today's orders
  {
    id: "ORD-001",
    status: "completed",
    time: "14:30",
    restaurant: "Pizza Palace",
    customerAddress: "123 Nguyen Hue St, District 1",
    earnings: 45000,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "ORD-002",
    status: "cancelled",
    time: "13:15",
    restaurant: "Burger King",
    customerAddress: "456 Le Loi St, District 3",
    earnings: 0,
    date: new Date().toISOString().split("T")[0],
  },
  {
    id: "ORD-003",
    status: "completed",
    time: "12:45",
    restaurant: "Sushi Express",
    customerAddress: "789 Dong Khoi St, District 1",
    earnings: 65000,
    date: new Date().toISOString().split("T")[0],
  },
  // Yesterday's orders
  {
    id: "ORD-004",
    status: "completed",
    time: "15:20",
    restaurant: "Coffee Bean",
    customerAddress: "321 Hai Ba Trung St, District 1",
    earnings: 35000,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
  {
    id: "ORD-005",
    status: "completed",
    time: "11:10",
    restaurant: "Pho 24",
    customerAddress: "654 Tran Hung Dao St, District 5",
    earnings: 42000,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
  // Day before yesterday
  {
    id: "ORD-006",
    status: "completed",
    time: "16:45",
    restaurant: "KFC",
    customerAddress: "987 Vo Thi Sau St, District 3",
    earnings: 55000,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  },
  // July 24th orders
  {
    id: "ORD-007",
    status: "completed",
    time: "17:30",
    restaurant: "McDonald's",
    customerAddress: "111 Pasteur St, District 1",
    earnings: 38000,
    date: "2025-07-24",
  },
  {
    id: "ORD-008",
    status: "completed",
    time: "14:15",
    restaurant: "Lotteria",
    customerAddress: "222 Cach Mang Thang 8 St, District 3",
    earnings: 29000,
    date: "2025-07-24",
  },
  // July 23rd orders
  {
    id: "ORD-009",
    status: "completed",
    time: "18:45",
    restaurant: "Texas Chicken",
    customerAddress: "333 Ben Thanh St, District 1",
    earnings: 51000,
    date: "2025-07-23",
  },
  {
    id: "ORD-010",
    status: "completed",
    time: "13:30",
    restaurant: "Subway",
    customerAddress: "444 Nguyen Trai St, District 5",
    earnings: 33000,
    date: "2025-07-23",
  },
];

const DriverHomeScreen = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [orderHistory] = useState(fakeHistory);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

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
              console.log("Driver location updated:", driverLocation);
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

  const handleAcceptOrder = (orderId: string) => {
    // Try to accept via WebSocket first
    const orderIdNum = parseInt(orderId.replace(/\D/g, ""));
    if (currentOrderRequest && !isNaN(orderIdNum)) {
      acceptOrder(orderIdNum);
    } else {
      // Fallback for fake orders
      console.log("Accept order:", orderId);
      Alert.alert("Order Accepted", `You have accepted order ${orderId}`);
    }
  };

  const handleDeclineOrder = (orderId: string) => {
    // Try to decline via WebSocket first
    const orderIdNum = parseInt(orderId.replace(/\D/g, ""));
    if (currentOrderRequest && !isNaN(orderIdNum)) {
      declineOrder(orderIdNum);
    } else {
      // Fallback for fake orders
      console.log("Decline order:", orderId);
      Alert.alert("Order Declined", `You have declined order ${orderId}`);
    }
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
        <OrderHistory
          groupedOrders={groupedOrders}
          availableDates={availableDates}
          scrollViewRef={scrollViewRef}
        />
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
});

export default DriverHomeScreen;
