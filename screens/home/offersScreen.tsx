import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAllRestaurantCoupons, RestaurantCoupon } from "@/api/couponsApi";
import { OfferCard } from "@/components/offers/OfferCard";
import { SpecialOffersHeader } from "@/components/offers/SpecialOffersHeader";
import { ThemedView } from "@/components/ThemedView";

export default function SpecialOffersScreen() {
  const [coupons, setCoupons] = useState<RestaurantCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllRestaurantCoupons();
      // Filter only active coupons
      const activeCoupons = data.filter(c => c.coupon.isActive);
      setCoupons(activeCoupons);
    } catch (err: any) {
      console.error("Error fetching coupons:", err);
      setError(err.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCoupons();
    setRefreshing(false);
  };

  const handleBack = () => {
    router.back();
  };

  const handleOfferPress = (coupon: RestaurantCoupon) => {
    // Navigate to restaurant page
    router.push(`/restaurant/${coupon.restaurantId}`);
  };

  const renderOffer = ({ item }: { item: RestaurantCoupon }) => (
    <OfferCard 
      restaurantCoupon={item} 
      onPress={() => handleOfferPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error ? error : "No special offers available at the moment"}
      </Text>
      {error && (
        <Text style={styles.retryText} onPress={fetchCoupons}>
          Tap to retry
        </Text>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <SpecialOffersHeader onBack={handleBack} />

      <ThemedView style={styles.content}>
        {loading && coupons.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading offers...</Text>
          </View>
        ) : (
          <FlatList
            data={coupons}
            renderItem={renderOffer}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#4CAF50"]}
                tintColor="#4CAF50"
              />
            }
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 100, // Space for tab navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 12,
  },
  retryText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
