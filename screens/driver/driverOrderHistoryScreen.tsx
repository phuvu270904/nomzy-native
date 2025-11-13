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

const DriverOrderHistoryScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "delivered" | "cancelled">("all");

  const fetchOrders = async () => {
    try {
      setError(null);
      const ordersData = await ordersApi.getDriverOrders();
      setOrders(ordersData);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load order history");
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#4CAF50";
      case "cancelled":
        return "#FF5722";
      case "on_the_way":
        return "#2196F3";
      default:
        return "#FF9800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "checkmark-circle";
      case "cancelled":
        return "close-circle";
      case "on_the_way":
        return "bicycle";
      default:
        return "time";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status.toLowerCase() === filter;
  });

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === "delivered").length,
    cancelled: orders.filter(o => o.status === "cancelled").length,
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Orders</Text>
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
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#4CAF50" }]}>
              {stats.delivered}
            </Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#FF5722" }]}>
              {stats.cancelled}
            </Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
            onPress={() => setFilter("all")}
          >
            <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
              All ({stats.total})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "delivered" && styles.filterButtonActive]}
            onPress={() => setFilter("delivered")}
          >
            <Text style={[styles.filterText, filter === "delivered" && styles.filterTextActive]}>
              Delivered ({stats.delivered})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === "cancelled" && styles.filterButtonActive]}
            onPress={() => setFilter("cancelled")}
          >
            <Text style={[styles.filterText, filter === "cancelled" && styles.filterTextActive]}>
              Cancelled ({stats.cancelled})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubText}>
              {filter === "all" 
                ? "You haven't delivered any orders yet"
                : `No ${filter} orders`}
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View style={styles.orderHeaderLeft}>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + "20" }]}>
                  <Ionicons 
                    name={getStatusIcon(order.status) as any} 
                    size={16} 
                    color={getStatusColor(order.status)} 
                  />
                  <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                    {formatStatus(order.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="restaurant-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Restaurant</Text>
                    <Text style={styles.detailValue}>{order.restaurant.name}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="person-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Customer</Text>
                    <Text style={styles.detailValue}>{order.user?.name || "N/A"}</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Delivery Address</Text>
                    <Text style={styles.detailValue}>
                      {order.address.streetAddress}, {order.address.city}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="fast-food-outline" size={20} color="#666" />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Items</Text>
                    <Text style={styles.detailValue}>
                      {order.orderItems.map(item => 
                        `${item.quantity}x ${item.product.name}`
                      ).join(", ")}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.orderFooter}>
                <View style={styles.earningsContainer}>
                  <Text style={styles.earningsLabel}>Delivery Fee</Text>
                  <Text style={styles.earningsValue}>${order.deliveryFee}</Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Order Total</Text>
                  <Text style={styles.totalValue}>${order.total}</Text>
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
    backgroundColor: "#4CAF50",
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
  statsContainer: {
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
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
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
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
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
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#999",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  earningsContainer: {
    flex: 1,
  },
  earningsLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },
  totalContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});

export default DriverOrderHistoryScreen;
