import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  convertApiOrderToUIOrder,
  ordersApi,
  OrderStatus,
} from "@/api/ordersApi";
import EmptyState from "@/components/orders/EmptyState";
import OrderCard, { Order } from "@/components/orders/OrderCard";
import OrdersHeader from "@/components/orders/OrdersHeader";
import TabNavigation, { Tab } from "@/components/orders/TabNavigation";

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (status?: OrderStatus) => {
    try {
      const apiOrders = await ordersApi.getMyOrders(status);
      const convertedOrders = apiOrders.map(convertApiOrderToUIOrder);
      setOrders(convertedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to load orders. Please try again.", [
        { text: "OK" },
      ]);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const status =
      activeTab === "active"
        ? "active"
        : activeTab === "completed"
          ? "completed"
          : activeTab === "cancelled"
            ? "cancelled"
            : null;
    await fetchOrders(status);
    setRefreshing(false);
  }, [activeTab, fetchOrders]);

  const handleTabPress = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      const status =
        tabId === "active"
          ? "active"
          : tabId === "completed"
            ? "completed"
            : tabId === "cancelled"
              ? "cancelled"
              : null;
      fetchOrders(status);
    },
    [fetchOrders],
  );

  useEffect(() => {
    const status =
      activeTab === "active"
        ? "active"
        : activeTab === "completed"
          ? "completed"
          : activeTab === "cancelled"
            ? "cancelled"
            : null;
    fetchOrders(status);
  }, [activeTab, fetchOrders]);

  const activeOrders = orders.filter((order) => order.status === "active");
  const completedOrders = orders.filter(
    (order) => order.status === "completed",
  );
  const cancelledOrders = orders.filter(
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

  const handleOrderPress = async (order: Order) => {
    Alert.alert(
      "Order Details",
      `Order #${order.orderNumber} from ${order.restaurantName}`,
    );
  };

  const handleTrackOrder = (order: Order) => {
    Alert.alert("Track Order", `Tracking order #${order.orderNumber}`);
  };

  const handleCancelOrder = async (order: Order) => {
    Alert.alert(
      "Cancel Order",
      `Are you sure you want to cancel order #${order.orderNumber}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await ordersApi.cancelOrder(parseInt(order.id));
              // Refresh orders after cancellation
              const status =
                activeTab === "active"
                  ? "active"
                  : activeTab === "completed"
                    ? "completed"
                    : activeTab === "cancelled"
                      ? "cancelled"
                      : null;
              await fetchOrders(status);
              Alert.alert("Success", "Order cancelled successfully");
            } catch (error) {
              console.error("Error cancelling order:", error);
              Alert.alert("Error", "Failed to cancel order. Please try again.");
            }
          },
        },
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
          onTabPress={handleTabPress}
        />
      </View>

      {currentOrders.length > 0 ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <EmptyState
            icon={emptyState.icon}
            title={emptyState.title}
            subtitle={emptyState.subtitle}
          />
        </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});
