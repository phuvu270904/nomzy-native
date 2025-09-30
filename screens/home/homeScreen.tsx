import { apiClient } from "@/utils/apiClient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import components
import CategoryList from "../../components/ui/HomeAndAction/CategoryList";
import Header from "../../components/ui/HomeAndAction/Header";
import ProductList from "../../components/ui/HomeAndAction/ProductList";
import PromoList from "../../components/ui/HomeAndAction/PromoList";
import RecommendedList from "../../components/ui/HomeAndAction/RecommendedList";
import SearchBar from "../../components/ui/HomeAndAction/SearchBar";
import SpecialOffers from "../../components/ui/HomeAndAction/SpecialOffers";

import { useUserLocation } from "@/hooks/useUserLocation";
import { useProducts } from "../../hooks/useProducts";

const HomeScreen = () => {
  const userLocation = useUserLocation();

  const {
    products: apiProducts,
    loading: productsLoading,
    error: productsError,
    hasMore,
    fetchProducts,
    loadMore,
    refresh,
    toggleLike,
  } = useProducts(10);

  const distance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const result = R * c;

    return `${result.toFixed(2)} km`;
  };

  const getRestaurantsInfo = async () => {
    try {
      const response = await apiClient.get("/restaurants");

      const rcmItems = response.data.map((restaurant: any) => {
        // derive feedbacks/rating info for the UI
        const feedbacks = Array.isArray(restaurant.feedbacks)
          ? restaurant.feedbacks
          : [];
        const reviewsCount =
          feedbacks.length > 0 ? feedbacks.length : (restaurant.reviews ?? 0);

        const averageFromFeedbacks =
          feedbacks.length > 0
            ? feedbacks.reduce((s: number, f: any) => s + (f?.rating || 0), 0) /
              feedbacks.length
            : null;

        const rating =
          averageFromFeedbacks !== null
            ? Number(averageFromFeedbacks.toFixed(1))
            : Number((restaurant.averageRating ?? restaurant.rating ?? 0) || 0);

        return {
          ...restaurant,
          distance: userLocation.hasLocation
            ? distance(
                userLocation.lat,
                userLocation.lng,
                restaurant.addresses?.[0]?.latitude,
                restaurant.addresses?.[0]?.longitude,
              )
            : undefined,
          // UI-friendly fields consumed by RecommendedList
          rating,
          reviews: reviewsCount,
          image:
            restaurant.image ||
            restaurant.avatar ||
            restaurant.products?.[0]?.imageUrl ||
            "",
          liked: restaurant.liked ?? false,
        };
      });
      setRecommendedItems(rcmItems);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts(1, 10, true);
  }, []);

  // Load restaurants when user location is available
  useEffect(() => {
    getRestaurantsInfo();
  }, [userLocation.hasLocation]);

  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);

  const handleNavigateNotification = () => {
    router.push("/notifications");
  };

  const handleNavigateCarts = () => {
    router.push("/carts");
  };

  const handleToggleRecommendedLike = async (id: number) => {
    try {
      // Find the current item to determine if it's currently liked
      const currentItem = recommendedItems.find((rec) => rec.id === id);
      const isCurrentlyLiked = currentItem?.liked || false;

      // Optimistically update the UI first
      setRecommendedItems((prevItems) =>
        prevItems.map((rec) =>
          rec.id === id ? { ...rec, liked: !rec.liked } : rec,
        ),
      );

      // Make the API call based on current state
      if (isCurrentlyLiked) {
        // Unlike - call delete
        await apiClient.delete(`/restaurants/${id}/favorite`);
      } else {
        // Like - call post
        await apiClient.post(`/restaurants/${id}/favorite`);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert the optimistic update on error
      setRecommendedItems((prevItems) =>
        prevItems.map((rec) =>
          rec.id === id ? { ...rec, liked: !rec.liked } : rec,
        ),
      );
    }
  };

  const handleToggleProductLike = (id: number) => {
    toggleLike(id);
  };

  const handleProductPress = (product: any) => {
    console.log("Product pressed:", product);
    // You can navigate to product detail screen here
  };

  const handleLoadMoreProducts = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error("Error loading more products:", error);
    }
  };

  const handleRetryProducts = async () => {
    try {
      await refresh();
    } catch (error) {
      console.error("Error retrying products:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      <Header
        onNotificationPress={handleNavigateNotification}
        onCartPress={handleNavigateCarts}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <SearchBar />
        <SpecialOffers />
        <CategoryList />
        <PromoList />
        <RecommendedList
          recommendedItems={recommendedItems}
          onToggleLike={handleToggleRecommendedLike}
        />
        <ProductList
          products={apiProducts}
          onToggleLike={handleToggleProductLike}
          onProductPress={handleProductPress}
          hasMore={hasMore}
          onLoadMore={handleLoadMoreProducts}
          isLoading={productsLoading}
          error={productsError}
          onRetry={handleRetryProducts}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
});

export default HomeScreen;
