import React, { RefObject } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { HistoryOrder, HistoryOrderCard } from "./HistoryOrderCard";

interface OrderHistoryProps {
  groupedOrders: { [key: string]: HistoryOrder[] };
  availableDates: string[];
  scrollViewRef: RefObject<ScrollView | null>;
}

export const OrderHistory = ({
  groupedOrders,
  availableDates,
  scrollViewRef,
}: OrderHistoryProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    if (dateString === today) return "Today";
    if (dateString === yesterday) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <View style={styles.historyContainer}>
        {availableDates.map((date) => (
          <View key={date} style={styles.dateSection}>
            <View style={[styles.dateSectionHeader]}>
              <Text style={styles.dateSectionEarnings}>
                {formatCurrency(
                  groupedOrders[date]
                    .filter((order) => order.status === "completed")
                    .reduce((total, order) => total + order.earnings, 0),
                )}
              </Text>
              <Text style={styles.dateSectionTitle}>{formatDate(date)}</Text>
            </View>
            <View style={styles.ordersList}>
              {groupedOrders[date].map((order) => (
                <HistoryOrderCard key={order.id} order={order} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  historyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  ordersList: {
    gap: 12,
  },
  dateSection: {
    marginBottom: 16,
  },
  dateSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F8F0",
    borderRadius: 8,
    marginBottom: 12,
  },
  dateSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  dateSectionEarnings: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
});
