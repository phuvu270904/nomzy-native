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

  const getRestaurantsInfo = async () => {
    try {
      const response = await apiClient.get("/restaurants");

      const rcmItems = response.data.map((restaurant: any) => ({
        ...restaurant,
        liked: false,
      }));
      setRecommendedItems(rcmItems);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return [];
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts(1, 10, true);
    getRestaurantsInfo();
  }, []);

  const [recommendedItems, setRecommendedItems] = useState<any[]>([]);

  const handleNavigateNotification = () => {
    router.push("/notifications");
  };

  const handleNavigateCarts = () => {
    router.push("/carts");
  };

  const handleToggleRecommendedLike = (id: number) => {
    setRecommendedItems((prevItems) =>
      prevItems.map((rec) =>
        rec.id === id ? { ...rec, liked: !rec.liked } : rec,
      ),
    );
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
