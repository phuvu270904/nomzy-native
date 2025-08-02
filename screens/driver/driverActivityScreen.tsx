import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DriverActivityScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "today" | "week" | "month"
  >("today");

  const [activityData, setActivityData] = useState({
    today: {
      earnings: 142.5,
      deliveries: 8,
      hours: 6.5,
      distance: 45.2,
      avgRating: 4.8,
      orders: [
        {
          id: "ORD-001",
          time: "10:30 AM",
          customer: "John Doe",
          restaurant: "Pizza Palace",
          earnings: 18.5,
          distance: "2.3 km",
          rating: 5,
        },
        {
          id: "ORD-002",
          time: "11:45 AM",
          customer: "Jane Smith",
          restaurant: "Burger King",
          earnings: 15.2,
          distance: "1.8 km",
          rating: 4,
        },
        {
          id: "ORD-003",
          time: "01:15 PM",
          customer: "Mike Johnson",
          restaurant: "Sushi Express",
          earnings: 22.8,
          distance: "3.1 km",
          rating: 5,
        },
      ],
    },
    week: {
      earnings: 890.25,
      deliveries: 52,
      hours: 38.5,
      distance: 287.4,
      avgRating: 4.7,
    },
    month: {
      earnings: 3240.75,
      deliveries: 185,
      hours: 142.3,
      distance: 1024.8,
      avgRating: 4.8,
    },
  });

  const currentData = activityData[selectedPeriod];

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
              `$${currentData.earnings.toFixed(2)}`,
              "#4CAF50",
            )}
            {renderStatCard(
              "bicycle-outline",
              "Deliveries",
              currentData.deliveries.toString(),
              "#4CAF50",
            )}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard(
              "time-outline",
              "Hours",
              `${currentData.hours}h`,
              "#2196F3",
            )}
            {renderStatCard(
              "speedometer-outline",
              "Distance",
              `${currentData.distance} km`,
              "#9C27B0",
            )}
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.performanceCard}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.performanceRow}>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                {currentData.avgRating}
              </Text>
              <Text style={styles.performanceLabel}>Avg Rating</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={
                      star <= Math.floor(currentData.avgRating)
                        ? "star"
                        : "star-outline"
                    }
                    size={12}
                    color="#FFD700"
                  />
                ))}
              </View>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                ${(currentData.earnings / currentData.deliveries).toFixed(2)}
              </Text>
              <Text style={styles.performanceLabel}>Avg per Order</Text>
            </View>
            <View style={styles.performanceItem}>
              <Text style={styles.performanceValue}>
                ${(currentData.earnings / currentData.hours).toFixed(2)}
              </Text>
              <Text style={styles.performanceLabel}>Hourly Rate</Text>
            </View>
          </View>
        </View>

        {/* Recent Orders (only for today) */}
        {selectedPeriod === "today" && (
          <View style={styles.ordersCard}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            {activityData.today.orders.map((order) => (
              <View key={order.id} style={styles.orderItem}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderTime}>{order.time}</Text>
                  <View style={styles.orderRating}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{order.rating}</Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.customerName}>{order.customer}</Text>
                  <Text style={styles.restaurantName}>{order.restaurant}</Text>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderDistance}>{order.distance}</Text>
                    <Text style={styles.orderEarnings}>+${order.earnings}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Weekly/Monthly Summary */}
        {selectedPeriod !== "today" && (
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Best Day</Text>
              <Text style={styles.summaryValue}>
                {selectedPeriod === "week"
                  ? "Tuesday - $165.40"
                  : "March 15 - $187.20"}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Peak Hours</Text>
              <Text style={styles.summaryValue}>12:00 PM - 2:00 PM</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Top Restaurant</Text>
              <Text style={styles.summaryValue}>Pizza Palace</Text>
            </View>
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
  orderDistance: {
    fontSize: 12,
    color: "#666",
  },
  orderEarnings: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
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
