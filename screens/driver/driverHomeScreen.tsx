import {
  AvailableOrders,
  OrderHistory,
  SearchingState,
  StatusToggle,
  type HistoryOrder,
  type OrderRequest,
} from "@/components/driver";
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StatusBar, StyleSheet } from "react-native";
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
  const [isOnline, setIsOnline] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const [orderHistory] = useState(fakeHistory);

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

  // Available orders for acceptance
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

  // Simulate switching between states for demo
  useEffect(() => {
    if (isOnline) {
      // Start with searching state
      setOnlineState("searching");

      // After 3 seconds, show available orders
      const timer = setTimeout(() => {
        setOnlineState("has_orders");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  const handleStatusChange = (newStatus: boolean) => {
    setIsOnline(newStatus);
  };

  const handleAcceptOrder = (orderId: string) => {
    console.log("Accept order:", orderId);
    // Handle order acceptance logic
  };

  const handleDeclineOrder = (orderId: string) => {
    console.log("Decline order:", orderId);
    // Handle order decline logic
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
          {onlineState === "searching" ? (
            <SearchingState />
          ) : (
            <AvailableOrders
              orders={availableOrders}
              onAcceptOrder={handleAcceptOrder}
              onDeclineOrder={handleDeclineOrder}
            />
          )}
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
