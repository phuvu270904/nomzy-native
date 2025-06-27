import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FoodDeliveryApp = () => {
  const categories = [
    { name: "Hamburger", icon: "🍔" },
    { name: "Pizza", icon: "🍕" },
    { name: "Noodles", icon: "🍜" },
    { name: "Meat", icon: "🥩" },
    { name: "Vegetables", icon: "🥬" },
    { name: "Dessert", icon: "🍰" },
    { name: "Drink", icon: "🍺" },
    { name: "More", icon: "🍱" },
  ];

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

  const filterOptions = ["All", "Hamburger", "Pizza", "Indian"];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
            }}
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.deliverText}>Deliver to</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Times Square</Text>
              <Text style={styles.dropdownIcon}>▼</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.notificationBadge} />
            <Ionicons
              name="notifications-outline"
              size={24}
              color="black"
              style={styles.bellIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="bag-handle-outline"
              size={24}
              color="black"
              style={styles.bellIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="What are you craving?"
            placeholderTextColor="#999"
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Special Offers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.promoCard}>
          <View style={styles.promoContent}>
            <Text style={styles.promoDiscount}>30%</Text>
            <Text style={styles.promoText}>DISCOUNT ONLY</Text>
            <Text style={styles.promoText}>VALID FOR TODAY!</Text>
          </View>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop&crop=center",
            }}
            style={styles.promoImage}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <View style={styles.categoryIcon}>
                <Text style={styles.categoryEmoji}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Discount Guaranteed */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Discount Guaranteed! 👌</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.promoItemsContainer}
        >
          {promoItems.map((item) => (
            <View key={item.id} style={styles.promoItemCard}>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>PROMO</Text>
              </View>
              <Image
                source={{ uri: item.image }}
                style={styles.promoItemImage}
              />
              <View style={styles.promoItemInfo}>
                <Text style={styles.promoItemName}>{item.name}</Text>
                <View style={styles.promoItemDetails}>
                  <Text style={styles.promoItemDistance}>{item.distance}</Text>
                  <Text style={styles.promoItemRating}>
                    ⭐ {item.rating} ({item.reviews})
                  </Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.currentPrice}>
                    ${item.price.toFixed(2)}
                  </Text>
                  <Text style={styles.originalPrice}>
                    ${item.originalPrice.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => {
                      setPromoItems((prevItems) =>
                        prevItems.map((promo) =>
                          promo.id === item.id
                            ? { ...promo, liked: !promo.liked }
                            : promo,
                        ),
                      );
                    }}
                  >
                    <Text style={styles.heartIcon}>
                      {item.liked ? "❤️" : "🤍"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Recommended For You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended For You 😋</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Options */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filterOptions.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.filterButton,
                index === 0 && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  index === 0 && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recommended Items */}
        <View style={styles.recommendedContainer}>
          {recommendedItems.map((item) => (
            <View key={item.id} style={styles.recommendedItem}>
              <Image
                source={{ uri: item.image }}
                style={styles.recommendedImage}
              />
              <View style={styles.recommendedInfo}>
                <Text style={styles.recommendedName}>{item.name}</Text>
                <View style={styles.recommendedDetails}>
                  <Text style={styles.recommendedDistance}>
                    {item.distance}
                  </Text>
                  <Text style={styles.recommendedRating}>
                    ⭐ {item.rating} ({item.reviews})
                  </Text>
                </View>
                <Text style={styles.recommendedPrice}>
                  ${item.price.toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => {
                  setRecommendedItems((prevItems) =>
                    prevItems.map((rec) =>
                      rec.id === item.id ? { ...rec, liked: !rec.liked } : rec,
                    ),
                  );
                }}
              >
                <Text style={styles.heartIcon}>{item.liked ? "❤️" : "🤍"}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  deliverText: {
    fontSize: 12,
    color: "#666",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  dropdownIcon: {
    marginLeft: 4,
    color: "#4CAF50",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    zIndex: 1,
  },
  bellIcon: {
    fontSize: 20,
  },
  bagIcon: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#000",
  },
  searchIcon: {
    fontSize: 16,
    color: "#999",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  promoCard: {
    backgroundColor: "#4CAF50",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoContent: {
    flex: 1,
  },
  promoDiscount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
  },
  promoText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  promoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  categoryItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  promoItemsContainer: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  promoItemCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  promoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  promoBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  promoItemImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  promoItemInfo: {
    padding: 15,
  },
  promoItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  promoItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  promoItemDistance: {
    fontSize: 12,
    color: "#666",
  },
  promoItemRating: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    flex: 1,
  },
  heartButton: {
    padding: 5,
  },
  heartIcon: {
    fontSize: 16,
  },
  filterContainer: {
    paddingLeft: 20,
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  recommendedContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recommendedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  recommendedImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  recommendedInfo: {
    flex: 1,
  },
  recommendedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  recommendedDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  recommendedDistance: {
    fontSize: 12,
    color: "#666",
  },
  recommendedRating: {
    fontSize: 12,
    color: "#666",
  },
  recommendedPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
    opacity: 0.6,
  },
  navIconActive: {
    fontSize: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 10,
    color: "#666",
  },
  navTextActive: {
    fontSize: 10,
    color: "#4CAF50",
    fontWeight: "600",
  },
});

export default FoodDeliveryApp;
