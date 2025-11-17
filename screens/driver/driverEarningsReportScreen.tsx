import { ApiOrder, ordersApi } from "@/api/ordersApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface EarningsData {
  totalEarnings: number;
  deliveredOrders: number;
  averagePerDelivery: number;
  thisMonth: number;
  lastMonth: number;
  dailyEarnings: { [key: string]: number };
}

const DriverEarningsReportScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [timeFrame, setTimeFrame] = useState<"week" | "month" | "all">("month");

  const fetchOrders = async () => {
    try {
      setError(null);
      const ordersData = await ordersApi.getDriverOrders();
      setOrders(ordersData);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load earnings report");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const calculateEarnings = (): EarningsData => {
    const deliveredOrders = orders.filter(order => order.status === "delivered");
    
    const totalEarnings = deliveredOrders.reduce((sum, order) => {
      return sum + parseFloat(order.deliveryFee || "0");
    }, 0);

    const averagePerDelivery = deliveredOrders.length > 0 
      ? totalEarnings / deliveredOrders.length 
      : 0;

    // Calculate this month and last month earnings
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonth = deliveredOrders
      .filter(order => {
        const orderDate = new Date(order.deliveredAt || order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, order) => sum + parseFloat(order.deliveryFee || "0"), 0);

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = deliveredOrders
      .filter(order => {
        const orderDate = new Date(order.deliveredAt || order.createdAt);
        return orderDate.getMonth() === lastMonthDate.getMonth() && 
               orderDate.getFullYear() === lastMonthDate.getFullYear();
      })
      .reduce((sum, order) => sum + parseFloat(order.deliveryFee || "0"), 0);

    // Group earnings by day
    const dailyEarnings: { [key: string]: number } = {};
    deliveredOrders.forEach(order => {
      const date = new Date(order.deliveredAt || order.createdAt);
      const dateKey = date.toISOString().split('T')[0];
      dailyEarnings[dateKey] = (dailyEarnings[dateKey] || 0) + parseFloat(order.deliveryFee || "0");
    });

    return {
      totalEarnings,
      deliveredOrders: deliveredOrders.length,
      averagePerDelivery,
      thisMonth,
      lastMonth,
      dailyEarnings,
    };
  };

  const getFilteredOrders = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeFrame) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return orders.filter(order => order.status === "delivered");
    }

    return orders.filter(order => {
      if (order.status !== "delivered") return false;
      const orderDate = new Date(order.deliveredAt || order.createdAt);
      return orderDate >= startDate;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const earnings = calculateEarnings();
  const filteredOrders = getFilteredOrders();
  const filteredEarnings = filteredOrders.reduce((sum, order) => 
    sum + parseFloat(order.deliveryFee || "0"), 0
  );

  const monthChange = earnings.lastMonth > 0 
    ? ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)
    : "0";

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5722" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOrders}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF6B00"]} />
        }
      >
        {/* Total Earnings Card */}
        <View style={styles.totalEarningsCard}>
          <View style={styles.earningsIcon}>
            <Ionicons name="wallet" size={32} color="#FF6B00" />
          </View>
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.totalEarningsAmount}>
            ${earnings.totalEarnings.toFixed(2)}
          </Text>
          <Text style={styles.earningsSubtext}>
            From {earnings.deliveredOrders} delivered orders
          </Text>
        </View>

        {/* Monthly Overview */}
        <View style={styles.monthlyOverview}>
          <View style={styles.monthlyCard}>
            <View style={styles.monthlyHeader}>
              <Ionicons name="calendar-outline" size={20} color="#FF6B00" />
              <Text style={styles.monthlyTitle}>This Month</Text>
            </View>
            <Text style={styles.monthlyAmount}>${earnings.thisMonth.toFixed(2)}</Text>
            <View style={styles.changeContainer}>
              <Ionicons 
                name={parseFloat(monthChange) >= 0 ? "trending-up" : "trending-down"} 
                size={16} 
                color={parseFloat(monthChange) >= 0 ? "#FF6B00" : "#FF5722"} 
              />
              <Text style={[
                styles.changeText,
                { color: parseFloat(monthChange) >= 0 ? "#FF6B00" : "#FF5722" }
              ]}>
                {monthChange}% vs last month
              </Text>
            </View>
          </View>

          <View style={styles.monthlyCard}>
            <View style={styles.monthlyHeader}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.monthlyTitle}>Last Month</Text>
            </View>
            <Text style={styles.monthlyAmount}>${earnings.lastMonth.toFixed(2)}</Text>
            <Text style={styles.monthlySubtext}>Previous period</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color="#FF6B00" />
            <Text style={styles.statValue}>${earnings.averagePerDelivery.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Avg per Delivery</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{earnings.deliveredOrders}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
        </View>

        {/* Time Frame Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, timeFrame === "week" && styles.filterButtonActive]}
            onPress={() => setTimeFrame("week")}
          >
            <Text style={[styles.filterText, timeFrame === "week" && styles.filterTextActive]}>
              This Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeFrame === "month" && styles.filterButtonActive]}
            onPress={() => setTimeFrame("month")}
          >
            <Text style={[styles.filterText, timeFrame === "month" && styles.filterTextActive]}>
              This Month
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeFrame === "all" && styles.filterButtonActive]}
            onPress={() => setTimeFrame("all")}
          >
            <Text style={[styles.filterText, timeFrame === "all" && styles.filterTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Earnings */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Deliveries</Text>
          <Text style={styles.sectionSubtitle}>
            ${filteredEarnings.toFixed(2)} earned
          </Text>
        </View>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No earnings yet</Text>
            <Text style={styles.emptySubText}>
              Complete deliveries to start earning
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.earningCard}>
              <View style={styles.earningHeader}>
                <View style={styles.earningLeft}>
                  <View style={styles.earningIconContainer}>
                    <Ionicons name="checkmark-circle" size={24} color="#FF6B00" />
                  </View>
                  <View>
                    <Text style={styles.earningRestaurant}>{order.restaurant.name}</Text>
                    <Text style={styles.earningDate}>
                      {formatDate(order.deliveredAt || order.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.earningAmount}>+${order.deliveryFee}</Text>
              </View>
              <View style={styles.earningDetails}>
                <View style={styles.earningDetailRow}>
                  <Ionicons name="location-outline" size={16} color="#999" />
                  <Text style={styles.earningDetailText}>
                    {order.address.city}
                  </Text>
                </View>
                <View style={styles.earningDetailRow}>
                  <Ionicons name="fast-food-outline" size={16} color="#999" />
                  <Text style={styles.earningDetailText}>
                    {order.orderItems.length} item(s)
                  </Text>
                </View>
              </View>
            </View>
          ))
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
    justifyContent: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF5722",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  totalEarningsCard: {
    backgroundColor: "#FF6B00",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  earningsIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 16,
    borderRadius: 50,
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  totalEarningsAmount: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  earningsSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  monthlyOverview: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  monthlyCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  monthlyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  monthlyTitle: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  monthlyAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  changeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  monthlySubtext: {
    fontSize: 12,
    color: "#999",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B00",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  earningCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  earningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  earningLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  earningIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  earningRestaurant: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  earningDate: {
    fontSize: 12,
    color: "#999",
  },
  earningAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  earningDetails: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  earningDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  earningDetailText: {
    fontSize: 12,
    color: "#999",
  },
});

export default DriverEarningsReportScreen;
