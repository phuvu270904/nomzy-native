import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ordersApi } from "@/api/ordersApi";
import { reviewsApi } from "@/api/reviewsApi";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";

export default function ReviewRestaurantScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState<{
    id: number;
    name: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;

      try {
        setIsLoading(true);
        const order = await ordersApi.getOrderById(parseInt(orderId, 10));
        
        if (order.restaurant) {
          setRestaurantInfo({
            id: order.restaurant.id,
            name: order.restaurant.name,
            avatar: order.restaurant.avatar,
          });
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
        Alert.alert("Error", "Failed to load restaurant information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting");
      return;
    }

    if (!restaurantInfo) {
      Alert.alert("Error", "Restaurant information not available");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await reviewsApi.submitRestaurantFeedback(restaurantInfo.id, {
        rating,
        review: review.trim(),
        isAnonymous,
      });

      // Show success message
      Alert.alert(
        "Thank You!",
        "Your feedback has been submitted successfully.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      Alert.alert("Error", "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    // Navigate to homepage
    router.replace("/(tabs)");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Rate Restaurant</ThemedText>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <ThemedText style={styles.skipText}>Skip</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Restaurant Info */}
          <View style={styles.restaurantSection}>
            <View style={styles.restaurantAvatar}>
              {restaurantInfo?.avatar ? (
                <Image
                  source={{ uri: restaurantInfo.avatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="restaurant" size={40} color="#4CAF50" />
                </View>
              )}
            </View>
            <ThemedText style={styles.restaurantName}>
              {restaurantInfo?.name || "Restaurant"}
            </ThemedText>
            <ThemedText style={styles.restaurantSubtitle}>
              How was your food?
            </ThemedText>
          </View>

          {/* Star Rating */}
          <View style={styles.ratingSection}>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={44}
                    color={star <= rating ? "#FFD700" : "#CCCCCC"}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <ThemedText style={styles.ratingText}>
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </ThemedText>
            )}
          </View>

          {/* Review Input */}
          <View style={styles.reviewSection}>
            <ThemedText style={styles.reviewLabel}>
              Share your experience (Optional)
            </ThemedText>
            <TextInput
              style={styles.reviewInput}
              placeholder="Tell us about the food quality, taste, presentation..."
              placeholderTextColor="#999999"
              multiline
              numberOfLines={4}
              value={review}
              onChangeText={setReview}
              textAlignVertical="top"
            />
          </View>

          {/* Anonymous Toggle */}
          <TouchableOpacity
            style={styles.anonymousToggle}
            onPress={() => setIsAnonymous(!isAnonymous)}
            activeOpacity={0.7}
          >
            <View style={styles.anonymousLeft}>
              <Ionicons
                name={isAnonymous ? "eye-off" : "eye"}
                size={20}
                color="#666666"
              />
              <ThemedText style={styles.anonymousText}>
                Submit anonymously
              </ThemedText>
            </View>
            <View
              style={[
                styles.toggleSwitch,
                isAnonymous && styles.toggleSwitchActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  isAnonymous && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, rating === 0 && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.submitButtonText}>
                Submit Feedback
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
  },
  restaurantSection: {
    alignItems: "center",
    paddingVertical: 32,
  },
  restaurantAvatar: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 8,
  },
  restaurantSubtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  ratingSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginTop: 8,
  },
  reviewSection: {
    marginTop: 24,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#2E2E2E",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  anonymousToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 24,
  },
  anonymousLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  anonymousText: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#DDDDDD",
    padding: 3,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: "#4CAF50",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
