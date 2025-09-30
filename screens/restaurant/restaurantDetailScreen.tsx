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
import { SafeAreaView } from "react-native-safe-area-context";

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

  const handleCall = () => {
    const phone = restaurant?.phone_number || restaurant?.phone;
    if (phone) {
      // Handle phone call
      console.log("Calling:", phone);
    }
  };

  const handleDirections = () => {
    if (restaurant?.addresses?.[0]) {
      // Handle directions
      console.log("Getting directions to:", restaurant.addresses[0]);
    }
  };

  const handleFavorite = () => {
    // Handle favorite toggle
    console.log("Toggle favorite for restaurant:", id);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading restaurant details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !restaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Restaurant Details</Text>
        <TouchableOpacity onPress={handleFavorite} style={styles.headerButton}>
          <Ionicons name="heart-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Restaurant Image (avatar) */}
        {(restaurant.avatar || restaurant.products?.[0]?.imageUrl) && (
          <Image
            source={{
              uri:
                restaurant.avatar ||
                restaurant.products?.[0]?.imageUrl ||
                undefined,
            }}
            style={styles.restaurantImage}
          />
        )}

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          {/* The API doesn't include a top-level description; show email/phone instead */}
          {restaurant.email && (
            <Text style={styles.description}>{restaurant.email}</Text>
          )}
          {restaurant.phone_number && (
            <Text style={styles.description}>
              Phone: {restaurant.phone_number}
            </Text>
          )}

          {/* Rating and Reviews */}
          {(restaurant.rating || restaurant.reviews) && (
            <View style={styles.ratingContainer}>
              {restaurant.rating && (
                <View style={styles.ratingItem}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{restaurant.rating}</Text>
                </View>
              )}
              {restaurant.reviews && (
                <Text style={styles.reviewsText}>
                  ({restaurant.reviews} reviews)
                </Text>
              )}
            </View>
          )}

          {/* Additional Info */}
          <View style={styles.detailsContainer}>
            {restaurant.cuisine && (
              <View style={styles.detailItem}>
                <Ionicons name="restaurant-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{restaurant.cuisine}</Text>
              </View>
            )}

            {restaurant.priceRange && (
              <View style={styles.detailItem}>
                <Ionicons name="cash-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{restaurant.priceRange}</Text>
              </View>
            )}

            {restaurant.openingHours && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{restaurant.openingHours}</Text>
              </View>
            )}

            {restaurant.addresses?.[0] && (
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.detailText}>
                  {restaurant.addresses[0].streetAddress ||
                    restaurant.addresses[0].label}
                  , {restaurant.addresses[0].city}
                </Text>
              </View>
            )}

            {restaurant.phone_number && (
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{restaurant.phone_number}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {restaurant.phone_number && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleCall}
              >
                <Ionicons name="call" size={20} color="#4CAF50" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            )}

            {restaurant.addresses?.[0] && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleDirections}
              >
                <Ionicons name="navigate" size={20} color="#4CAF50" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Products List */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
              Menu
            </Text>
            {restaurant.products && restaurant.products.length > 0 ? (
              restaurant.products.map((p) => (
                <View key={p.id} style={styles.productCard}>
                  {p.imageUrl ? (
                    <Image
                      source={{ uri: p.imageUrl }}
                      style={styles.productImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.productImage,
                        styles.productImagePlaceholder,
                      ]}
                    />
                  )}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{p.name}</Text>
                    {p.description ? (
                      <Text style={styles.productDescription}>
                        {p.description}
                      </Text>
                    ) : null}
                    <Text style={styles.productPrice}>
                      {p.discountPrice ? `$${p.discountPrice}` : `$${p.price}`}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={{ color: "#666" }}>No products available.</Text>
            )}
          </View>

          {/* Feedbacks */}
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 10 }}>
              Reviews
            </Text>
            {restaurant.feedbacks && restaurant.feedbacks.length > 0 ? (
              restaurant.feedbacks.map((f) => (
                <View key={f.id} style={styles.feedbackCard}>
                  <View style={styles.feedbackHeader}>
                    <Text style={styles.feedbackRating}>{f.rating} ★</Text>
                    <Text style={styles.feedbackDate}>
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleDateString()
                        : ""}
                    </Text>
                  </View>
                  {f.review ? (
                    <Text style={styles.feedbackText}>{f.review}</Text>
                  ) : (
                    <Text style={styles.feedbackText}>(No review text)</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={{ color: "#666" }}>No reviews yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  scrollView: {
    flex: 1,
  },
  restaurantImage: {
    width: "100%",
    height: 250,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginLeft: 5,
  },
  reviewsText: {
    fontSize: 14,
    color: "#666",
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  actionButtonText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 8,
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    resizeMode: "cover",
    backgroundColor: "#F0F0F0",
  },
  productImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  productDescription: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
    marginTop: 6,
  },
  feedbackCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    marginBottom: 12,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  feedbackRating: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFD700",
  },
  feedbackDate: {
    fontSize: 12,
    color: "#999",
  },
  feedbackText: {
    fontSize: 14,
    color: "#333",
  },
});
