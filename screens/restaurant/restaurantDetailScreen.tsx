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

interface Restaurant {
  id: number;
  name: string;
  description?: string;
  rating?: number;
  reviews?: number;
  imageUrl?: string;
  addresses?: Array<{
    street?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  }>;
  phone?: string;
  email?: string;
  openingHours?: string;
  cuisine?: string;
  priceRange?: string;
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
    if (restaurant?.phone) {
      // Handle phone call
      console.log("Calling:", restaurant.phone);
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
        {/* Restaurant Image */}
        {restaurant.imageUrl && (
          <Image
            source={{ uri: restaurant.imageUrl }}
            style={styles.restaurantImage}
          />
        )}

        {/* Restaurant Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          {restaurant.description && (
            <Text style={styles.description}>{restaurant.description}</Text>
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
                  {restaurant.addresses[0].street},{" "}
                  {restaurant.addresses[0].city}
                </Text>
              </View>
            )}

            {restaurant.phone && (
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.detailText}>{restaurant.phone}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {restaurant.phone && (
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
});
