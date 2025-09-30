import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { apiClient } from "@/utils/apiClient";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  restaurantId?: number;
  categoryId?: number;
}

interface Address {
  id: number;
  userId?: number;
  streetAddress?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  state?: string;
  isDefault?: boolean;
  label?: string;
  latitude?: string | null;
  longitude?: string | null;
}

interface Feedback {
  id: number;
  userId: number;
  restaurantId: number;
  rating: number;
  review?: string | null;
  isAnonymous?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Restaurant {
  id: number;
  name: string;
  gender?: string | null;
  email?: string | null;
  phone_number?: string | null;
  avatar?: string | null;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: Product[];
  addresses?: Address[];
  feedbacks?: Feedback[];
  averageRating?: number;
  liked?: boolean;
  // legacy / UI fields
  description?: string;
  imageUrl?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  cuisine?: string;
  priceRange?: string;
  openingHours?: string;
}

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"About" | "Offers" | "Reviews">(
    "About",
  );

  useEffect(() => {
    if (id) {
      fetchRestaurantDetails();
    }
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/restaurants/${id}`);
      // API returns restaurant object matching Restaurant interface
      setRestaurant(response.data);
    } catch (err: any) {
      console.error("Error fetching restaurant details:", err);
      setError(err.message || "Failed to fetch restaurant details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = () => {
    // Handle favorite toggle
    console.log("Toggle favorite for restaurant:", id);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading restaurant details...</Text>
        </View>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "Restaurant not found"}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchRestaurantDetails}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Image */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri:
                restaurant.avatar ||
                restaurant.products?.[0]?.imageUrl ||
                "https://via.placeholder.com/400x300",
            }}
            style={styles.heroImage}
          />

          {/* Header Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFavorite}
              style={styles.headerButton}
            >
              <Ionicons
                name={restaurant.liked ? "heart" : "heart-outline"}
                size={24}
                color={restaurant.liked ? "#FF4B4B" : "#FFF"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Info Card */}
        <View style={styles.restaurantInfoCard}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {restaurant.averageRating?.toFixed(1) || "4.5"}
              </Text>
            </View>
            <Text style={styles.reviewCount}>
              ({restaurant.feedbacks?.length || 0} reviews)
            </Text>
            <Text style={styles.deliveryTime}>• 25-30 min</Text>
          </View>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>Free Delivery</Text>
            </View>
            {restaurant.cuisine && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{restaurant.cuisine}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {["About", "Offers", "Reviews"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.activeTabButton,
              ]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === "About" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              {restaurant.email ||
                "Welcome to our restaurant! We serve delicious food with the finest ingredients."}
            </Text>

            {restaurant.addresses?.[0] && (
              <View style={styles.addressSection}>
                <Text style={styles.sectionTitle}>Location</Text>
                <Text style={styles.addressText}>
                  {restaurant.addresses[0].streetAddress},{" "}
                  {restaurant.addresses[0].city}
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === "Offers" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Special Offers</Text>
            <View style={styles.offerCard}>
              <Text style={styles.offerTitle}>Free Delivery</Text>
              <Text style={styles.offerDescription}>
                Free delivery on orders above $25
              </Text>
            </View>
          </View>
        )}

        {activeTab === "Reviews" && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {restaurant.feedbacks && restaurant.feedbacks.length > 0 ? (
              restaurant.feedbacks.map((feedback) => (
                <View key={feedback.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, index) => (
                        <Ionicons
                          key={index}
                          name="star"
                          size={14}
                          color={
                            index < feedback.rating ? "#FFD700" : "#E0E0E0"
                          }
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewDate}>
                      {feedback.createdAt
                        ? new Date(feedback.createdAt).toLocaleDateString()
                        : ""}
                    </Text>
                  </View>
                  <Text style={styles.reviewText}>
                    {feedback.review || "Great food and service!"}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet</Text>
            )}
          </View>
        )}

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          {restaurant.products && restaurant.products.length > 0 ? (
            restaurant.products.map((product) => (
              <View key={product.id} style={styles.menuItem}>
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{product.name}</Text>
                    <Text style={styles.menuItemDescription}>
                      {product.description || "Delicious and fresh"}
                    </Text>
                    <Text style={styles.menuItemPrice}>
                      ${product.discountPrice || product.price}
                    </Text>
                  </View>
                  <View style={styles.menuItemImageContainer}>
                    {product.imageUrl ? (
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.menuItemImage}
                      />
                    ) : (
                      <View style={styles.menuItemImagePlaceholder}>
                        <Ionicons name="restaurant" size={24} color="#999" />
                      </View>
                    )}
                    <TouchableOpacity style={styles.addButton}>
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noMenuText}>No menu items available</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
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
    fontSize: 16,
    color: "#FF5722",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    position: "relative",
    height: 300,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  restaurantInfoCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  deliveryTime: {
    fontSize: 14,
    color: "#666",
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "600",
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  addressSection: {
    marginTop: 20,
  },
  addressText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  offerCard: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: "#666",
  },
  reviewCard: {
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewRating: {
    flexDirection: "row",
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: "#999",
  },
  reviewText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noReviewsText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
  menuSection: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: "row",
    padding: 16,
  },
  menuItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 18,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
  menuItemImageContainer: {
    position: "relative",
    width: 80,
    height: 80,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
  },
  menuItemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  noMenuText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
});
