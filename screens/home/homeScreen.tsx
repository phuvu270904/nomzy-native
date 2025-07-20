import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Import components
import { useFetch } from "@/hooks";
import CategoryList from "../../components/ui/HomeAndAction/CategoryList";
import Header from "../../components/ui/HomeAndAction/Header";
import ProductList from "../../components/ui/HomeAndAction/ProductList";
import PromoList from "../../components/ui/HomeAndAction/PromoList";
import RecommendedList from "../../components/ui/HomeAndAction/RecommendedList";
import SearchBar from "../../components/ui/HomeAndAction/SearchBar";
import SpecialOffers from "../../components/ui/HomeAndAction/SpecialOffers";

const HomeScreen = () => {
  const { data } = useFetch("");
  console.log("Fetched data:", data);

  const [promoItems, setPromoItems] = useState([
    {
      id: 1,
      name: "Mixed Salad Bowl",
      distance: "1.5 km",
      rating: 4.8,
      reviews: 126,
      price: 6.0,
      originalPrice: 9.0,
      image:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&h=150&fit=crop&crop=center",
      liked: false,
    },
    {
      id: 2,
      name: "Vegetarian Menu",
      distance: "1.7 km",
      rating: 4.7,
      reviews: 900,
      price: 5.5,
      originalPrice: 9.0,
      image:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&h=150&fit=crop&crop=center",
      liked: false,
    },
  ]);

  const [recommendedItems, setRecommendedItems] = useState([
    {
      id: 1,
      name: "Vegetarian Noodles",
      distance: "800 m",
      rating: 4.9,
      reviews: 236,
      price: 2.0,
      image:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=80&h=80&fit=crop&crop=center",
      liked: true,
    },
    {
      id: 2,
      name: "Pizza Hut - Lumintu",
      distance: "1.2 km",
      rating: 4.5,
      reviews: 179,
      price: 1.5,
      image:
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop&crop=center",
      liked: false,
    },
    {
      id: 3,
      name: "Mozzarella Cheese Burger",
      distance: "1.6 km",
      rating: 4.6,
      reviews: 156,
      price: 2.5,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop&crop=center",
      liked: true,
    },
    {
      id: 4,
      name: "Fruit Salad - Kumpa",
      distance: "1.4 km",
      rating: 4.7,
      reviews: 174,
      price: 2.0,
      image:
        "https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=80&h=80&fit=crop&crop=center",
      liked: false,
    },
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Grilled Chicken Breast",
      description: "Tender grilled chicken with herbs and spices",
      price: 12.99,
      image:
        "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=200&h=200&fit=crop",
      category: "Main Course",
      rating: 4.8,
      liked: false,
    },
    {
      id: 2,
      name: "Caesar Salad",
      description: "Fresh romaine lettuce with caesar dressing",
      price: 8.5,
      image:
        "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=200&h=200&fit=crop",
      category: "Salad",
      rating: 4.6,
      liked: true,
    },
    {
      id: 3,
      name: "Margherita Pizza",
      description: "Classic pizza with tomato, mozzarella and basil",
      price: 14,
      image:
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=200&fit=crop",
      category: "Pizza",
      rating: 4.9,
      liked: false,
    },
    {
      id: 4,
      name: "Chocolate Cake",
      description: "Rich chocolate cake with cream frosting",
      price: 6.75,
      image:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
      category: "Dessert",
      rating: 4.7,
      liked: true,
    },
    {
      id: 5,
      name: "Beef Burger",
      description: "Juicy beef patty with fresh vegetables",
      price: 11.25,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
      category: "Burger",
      rating: 4.5,
      liked: false,
    },
    {
      id: 6,
      name: "Fresh Smoothie",
      description: "Mixed berry smoothie with yogurt",
      price: 5.99,
      image:
        "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=200&h=200&fit=crop",
      category: "Beverage",
      rating: 4.4,
      liked: true,
    },
  ]);

  const filterOptions = ["All", "Hamburger", "Pizza", "Indian"];

  const handleNavigateNotification = () => {
    router.push("/notifications");
  };

  const handleNavigateCarts = () => {
    router.push("/carts");
  };

  const handleTogglePromoLike = (id: number) => {
    setPromoItems((prevItems) =>
      prevItems.map((promo) =>
        promo.id === id ? { ...promo, liked: !promo.liked } : promo,
      ),
    );
  };

  const handleToggleRecommendedLike = (id: number) => {
    setRecommendedItems((prevItems) =>
      prevItems.map((rec) =>
        rec.id === id ? { ...rec, liked: !rec.liked } : rec,
      ),
    );
  };

  const handleToggleProductLike = (id: number) => {
    setProducts((prevItems) =>
      prevItems.map((product) =>
        product.id === id ? { ...product, liked: !product.liked } : product,
      ),
    );
  };

  const handleProductPress = (product: any) => {
    console.log("Product pressed:", product);
    // You can navigate to product detail screen here
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
        <PromoList
          promoItems={promoItems}
          onToggleLike={handleTogglePromoLike}
        />
        <RecommendedList
          recommendedItems={recommendedItems}
          onToggleLike={handleToggleRecommendedLike}
          filterOptions={filterOptions}
        />
        <ProductList
          products={products}
          onToggleLike={handleToggleProductLike}
          onProductPress={handleProductPress}
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
