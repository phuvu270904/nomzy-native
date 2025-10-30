import { ordersApi, type ApiOrder } from "@/api/ordersApi";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DriverActivityScreen = () => {
  const { fetchUserProfile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch driver orders - only if user is a driver
  useEffect(() => {
    const fetchDriverOrders = async () => {
      const user = await fetchUserProfile();
      if (!user || user.user.role !== "driver") {
        console.log("User is not a Driver");
        return;
      }
      setIsLoading(true);
      try {
        const fetchedOrders = await ordersApi.getDriverOrders();
        setOrders(fetchedOrders);
      } catch (error: any) {
        console.error("Failed to fetch driver orders:", error);
        Alert.alert(
          "Error",
          "Failed to load activity data. Please try again later.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverOrders();
  }, []);

  // Filter orders based on selected period
  const getFilteredOrders = () => {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      switch (selectedPeriod) {
        case "today":
          return orderDate >= startOfToday;
        case "week":
          return orderDate >= startOfWeek;
        case "month":
          return orderDate >= startOfMonth;
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate stats from filtered orders
  const calculateStats = () => {
    const completedOrders = filteredOrders.filter(
      (order) => order.status.toLowerCase() === "delivered",
    );

    const totalEarnings = completedOrders.reduce(
      (sum, order) => sum + parseFloat(order.deliveryFee || "0"),
      0,
    );

    const deliveries = completedOrders.length;

    return {
      earnings: totalEarnings,
      deliveries,
    };
  };

  const currentData = calculateStats();

  const renderPeriodButton = (
    period: "today" | "week" | "month",
    label: string,
  ) => (
    <TouchableOpacity
      style={[
        styles.periodButton,
        selectedPeriod === period && styles.periodButtonActive,
      ]}
      onPress={() => setSelectedPeriod(period)}
    >
      <Text
        style={[
          styles.periodButtonText,
          selectedPeriod === period && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStatCard = (
    icon: string,
    title: string,
    value: string,
    color: string,
  ) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {renderPeriodButton("today", "Today")}
          {renderPeriodButton("week", "This Week")}
          {renderPeriodButton("month", "This Month")}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            {renderStatCard(
              "cash-outline",
              "Earnings",
              `${currentData.earnings.toFixed(2)} VND`,
              "#4CAF50",
            )}
            {renderStatCard(
              "bicycle-outline",
              "Deliveries",
              currentData.deliveries.toString(),
              "#4CAF50",
            )}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.performanceCard}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.performanceRow}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                {currentData.deliveries > 0
                  ? (currentData.earnings / currentData.deliveries).toFixed(2)
                  : "0.00"}
              </Text>
              <Text style={styles.performanceLabel}>Avg per Order (VND)</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders (only for today) */}
        {selectedPeriod === "today" && (
          <View style={styles.ordersCard}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : filteredOrders.length === 0 ? (
              <Text style={styles.emptyText}>No orders today</Text>
            ) : (
              filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderItem}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderTime}>
                      {new Date(order.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            order.status.toLowerCase() === "delivered"
                              ? "#4CAF5020"
                              : "#FF980020",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              order.status.toLowerCase() === "delivered"
                                ? "#4CAF50"
                                : "#FF9800",
                          },
                        ]}
                      >
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.customerName}>
                      {order.user?.name || "Customer"}
                    </Text>
                    <Text style={styles.restaurantName}>
                      {order.restaurant.name}
                    </Text>
                    <View style={styles.orderFooter}>
                      <Text style={styles.orderAddress}>
                        {order.address.streetAddress}, {order.address.city}
                      </Text>
                      <Text style={styles.orderEarnings}>
                        +{parseFloat(order.deliveryFee || "0").toFixed(2)} VND
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Weekly/Monthly Summary */}
        {selectedPeriod !== "today" && (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Summary</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            ) : filteredOrders.length === 0 ? (
              <Text style={styles.emptyText}>
                No orders in this period
              </Text>
            ) : (
              <>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Orders</Text>
                  <Text style={styles.summaryValue}>
                    {filteredOrders.length}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Completed Orders</Text>
                  <Text style={styles.summaryValue}>
                    {
                      filteredOrders.filter(
                        (o) => o.status.toLowerCase() === "delivered",
                      ).length
                    }
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Earnings</Text>
                  <Text style={styles.summaryValue}>
                    {currentData.earnings.toFixed(2)} VND
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  filterButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "#4CAF50",
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  periodButtonTextActive: {
    color: "#FFFFFF",
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 6,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: "#666",
  },
  performanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  performanceItem: {
    alignItems: "center",
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  stars: {
    flexDirection: "row",
    gap: 2,
  },
  ordersCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderTime: {
    fontSize: 12,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  orderRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
  },
  orderDetails: {
    gap: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  restaurantName: {
    fontSize: 14,
    color: "#666",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  orderAddress: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  orderDistance: {
    fontSize: 12,
    color: "#666",
  },
  orderEarnings: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    paddingVertical: 20,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default DriverActivityScreen;
