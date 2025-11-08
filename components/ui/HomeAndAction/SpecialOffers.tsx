import { getAllRestaurantCoupons, RestaurantCoupon } from "@/api/couponsApi";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SpecialOffers() {
  const [featuredOffer, setFeaturedOffer] = useState<RestaurantCoupon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedOffer();
  }, []);

  const fetchFeaturedOffer = async () => {
    try {
      setLoading(true);
      const coupons = await getAllRestaurantCoupons();

      if (!coupons || coupons.length === 0) return;

      // Filter only active coupons
      const activeCoupons = coupons.filter(c => c.coupon.isActive);

      // Sort by createdAt descending (latest first)
      const sortedCoupons = activeCoupons.sort(
        (a, b) => new Date(b.coupon.createdAt).getTime() - new Date(a.coupon.createdAt).getTime()
      );

      // Get the latest active coupon
      const latestCoupon = sortedCoupons[0];

      if (latestCoupon) {
        setFeaturedOffer(latestCoupon);
      }
    } catch (error) {
      console.error("Error fetching featured offer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToOffers = () => {
    router.navigate("/offers");
  };

  const handleNavigateToRestaurant = () => {
    if (featuredOffer) {
      router.push(`/restaurant/${featuredOffer.restaurantId}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Special Offers</Text>
          <TouchableOpacity onPress={handleNavigateToOffers}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, styles.loadingCard]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </View>
    );
  }

  if (!featuredOffer) {
    return null; // Don't show section if no offers available
  }

  const discountValue = featuredOffer.coupon.type === "percentage"
    ? Math.round(parseFloat(featuredOffer.coupon.value))
    : Math.round(parseFloat(featuredOffer.coupon.value));

  const discountText = featuredOffer.coupon.type === "percentage"
    ? `${discountValue}%`
    : `$${discountValue}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Special Offers</Text>
        <TouchableOpacity onPress={handleNavigateToOffers}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={styles.card} 
        onPress={handleNavigateToRestaurant}
        activeOpacity={0.8}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.discount}>{discountText}</Text>
          <Text style={styles.text} numberOfLines={1}>{featuredOffer.coupon.name.toUpperCase()}</Text>
          <Text style={styles.text} numberOfLines={1}>{featuredOffer.restaurant.name.toUpperCase()}</Text>
        </View>
        <Image
          source={{
            uri: featuredOffer.restaurant.avatar,
          }}
          style={styles.image}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  seeAll: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  loadingCard: {
    minHeight: 120,
    justifyContent: "center",
  },
  discount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
