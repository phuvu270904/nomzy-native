import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EmptyState from "@/components/orders/EmptyState";
import OrderCard, { Order } from "@/components/orders/OrderCard";
import OrdersHeader from "@/components/orders/OrdersHeader";
import TabNavigation, { Tab } from "@/components/orders/TabNavigation";

// Mock data for demonstration
const mockOrders: Order[] = [
	{
		id: "1",
		restaurantName: "Pizza Palace",
		restaurantImage:
			"https://img1.wsimg.com/isteam/ip/538bcd6d-a924-461e-a467-d49ed06293ca/SRO_1507-7e12095.jpg",
		items: ["Margherita Pizza", "Caesar Salad", "Coca Cola"],
		total: 24.99,
		status: "active",
		orderDate: "Today, 2:30 PM",
		estimatedTime: "25 mins",
		orderNumber: "ORD001",
	},
	{
		id: "2",
		restaurantName: "Burger House",
		restaurantImage:
			"https://dynamic-media-cdn.tripadvisor.com/media/photo-o/19/19/ae/42/burger.jpg?w=500&h=-1&s=1",
		items: ["Cheeseburger", "French Fries", "Milkshake"],
		total: 18.5,
		status: "active",
		orderDate: "Today, 1:15 PM",
		estimatedTime: "15 mins",
		orderNumber: "ORD002",
	},
	{
		id: "3",
		restaurantName: "Sushi Express",
		restaurantImage:
			"https://media.licdn.com/dms/image/v2/C4E0BAQFiS0kuRmXfSg/company-logo_200_200/company-logo_200_200/0/1630898371571/_logo?e=2147483647&v=beta&t=sFMcU-IEPLeMCdajx4PmOx7axI3RozI85tZ9CfEpspU",
		items: ["California Roll", "Salmon Nigiri", "Miso Soup"],
		total: 32.75,
		status: "completed",
		orderDate: "Yesterday, 7:45 PM",
		orderNumber: "ORD003",
	},
	{
		id: "4",
		restaurantName: "Thai Garden",
		restaurantImage:
			"https://static.wixstatic.com/media/689e13_2c1386e11e254fa48c759adfb61eb631~mv2.jpg/v1/fill/w_980,h_1249,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/689e13_2c1386e11e254fa48c759adfb61eb631~mv2.jpg",
		items: ["Pad Thai", "Green Curry", "Spring Rolls"],
		total: 28.9,
		status: "completed",
		orderDate: "2 days ago, 6:30 PM",
		orderNumber: "ORD004",
	},
	{
		id: "5",
		restaurantName: "Mexican Cantina",
		restaurantImage:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaO3ma8KILAhs0V_xcX0sOl9IotVP-tuDQWw&s",
		items: ["Chicken Burrito", "Guacamole", "Nachos"],
		total: 21.45,
		status: "cancelled",
		orderDate: "3 days ago, 8:00 PM",
		orderNumber: "ORD005",
	},
]

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState("active");

  const activeOrders = mockOrders.filter((order) => order.status === "active");
  const completedOrders = mockOrders.filter(
    (order) => order.status === "completed",
  );
  const cancelledOrders = mockOrders.filter(
    (order) => order.status === "cancelled",
  );

  const tabs: Tab[] = [
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  const getCurrentOrders = () => {
    switch (activeTab) {
      case "active":
        return activeOrders;
      case "completed":
        return completedOrders;
      case "cancelled":
        return cancelledOrders;
      default:
        return [];
    }
  };

  const handleOrderPress = (order: Order) => {
    Alert.alert(
      "Order Details",
      `Order #${order.orderNumber} from ${order.restaurantName}`,
    );
  };

  const handleTrackOrder = (order: Order) => {
    Alert.alert("Track Order", `Tracking order #${order.orderNumber}`);
  };

  const handleCancelOrder = (order: Order) => {
    Alert.alert(
      "Cancel Order",
      `Are you sure you want to cancel order #${order.orderNumber}?`,
      [
        { text: "No", style: "cancel" },
        { text: "Yes", style: "destructive" },
      ],
    );
  };

  const handleReorder = (order: Order) => {
    Alert.alert("Reorder", `Reordering from ${order.restaurantName}`);
  };

  const handleSearchPress = () => {
    Alert.alert("Search", "Search functionality coming soon");
  };

  const handleMorePress = () => {
    Alert.alert("More Options", "Additional options coming soon");
  };

  const getEmptyStateContent = () => {
    switch (activeTab) {
      case "active":
        return {
          icon: "receipt-outline" as const,
          title: "No Active Orders",
          subtitle:
            "You don't have any active orders at the moment. Order your favorite food now!",
        };
      case "completed":
        return {
          icon: "checkmark-circle-outline" as const,
          title: "No Completed Orders",
          subtitle:
            "You haven't completed any orders yet. Start ordering to see your history here.",
        };
      case "cancelled":
        return {
          icon: "close-circle-outline" as const,
          title: "No Cancelled Orders",
          subtitle: "You don't have any cancelled orders. That's great!",
        };
      default:
        return {
          icon: "receipt-outline" as const,
          title: "No Orders",
          subtitle: "No orders found.",
        };
    }
  };

  const currentOrders = getCurrentOrders();
  const emptyState = getEmptyStateContent();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <OrdersHeader
        onSearchPress={handleSearchPress}
        onMorePress={handleMorePress}
      />

      <View style={styles.tabContainer}>
        <TabNavigation
          tabs={tabs}
          activeTabId={activeTab}
          onTabPress={setActiveTab}
        />
      </View>

      {currentOrders.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => handleOrderPress(order)}
              onTrackOrder={() => handleTrackOrder(order)}
              onCancelOrder={() => handleCancelOrder(order)}
              onReorder={() => handleReorder(order)}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyState
          icon={emptyState.icon}
          title={emptyState.title}
          subtitle={emptyState.subtitle}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  tabContainer: {
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});
