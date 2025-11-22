import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { favoritesApi } from "@/api/favoritesApi";
import { ordersApi } from "@/api/ordersApi";
import { reviewsApi } from "@/api/reviewsApi";
import {
  EditProfileModal,
  ManageAddressesModal,
  ProfileHeader,
  ProfileMenuItemData,
  ProfileSection,
  ProfileStats,
  ProfileStatsData,
  ProfileToggleItem,
  ProfileToggleItemData,
  UserProfile,
} from "@/components/profile";
import { useAuth } from "@/hooks";
import { toggleAIChat } from "@/store/slices/aiChatSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { apiClient } from "@/utils/apiClient";

export default function ProfileScreen() {
  const { logout } = useAuth();
  const dispatch = useAppDispatch();
  const aiChatEnabled = useAppSelector((state) => state.aiChat.isEnabled);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [manageAddressesModalVisible, setManageAddressesModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setEditProfileModalVisible(true);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile data
      const response = await apiClient.get("/auth/profile");
      const data = response.data;

      // Map API response to UI model
      const apiUser = data.user;
      const mappedUser: UserProfile = {
        id: String(apiUser.id),
        name: apiUser.name || "",
        email: apiUser.email || "",
        phone: apiUser.phone_number || apiUser.phone || undefined,
        avatar: apiUser.avatar || "https://via.placeholder.com/80",
        memberSince: apiUser.createdAt
          ? new Date(apiUser.createdAt).toLocaleString(undefined, {
              month: "long",
              year: "numeric",
            })
          : undefined,
        verified: apiUser.role === "user" ? true : false,
      };

      setUser(mappedUser);

      // Fetch stats from APIs in parallel
      const [ordersResponse, favoritesResponse, restaurantFeedbacksResponse, driverReviewsResponse] = await Promise.all([
        ordersApi.getMyOrders().catch(() => []),
        favoritesApi.getFavorites().catch(() => []),
        reviewsApi.getUserFeedbacks().catch(() => []),
        reviewsApi.getUserDriverReviews().catch(() => []),
      ]);

      // Calculate total reviews (restaurant feedbacks + driver reviews)
      const totalReviews = restaurantFeedbacksResponse.length + driverReviewsResponse.length;

      setStats({
        totalOrders: ordersResponse.length,
        favoriteRestaurants: favoritesResponse.length,
        reviews: totalReviews,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfile();
  }, []);

  // Profile menu sections
  const accountSection: ProfileMenuItemData[] = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: "person-outline",
      iconColor: "#1BAC4B",
      onPress: handleEditProfile,
    },
    // {
    //   id: "payment-methods",
    //   title: "Payment Methods",
    //   subtitle: "Manage your payment options",
    //   icon: "card-outline",
    //   iconColor: "#4ECDC4",
    //   onPress: () => Alert.alert("Payment Methods", "Payment methods screen"),
    // },
    {
      id: "addresses",
      title: "My Addresses",
      subtitle: "Delivery addresses",
      icon: "location-outline",
      iconColor: "#FF6B6B",
      onPress: () => setManageAddressesModalVisible(true),
    },
  ];

  const preferencesSection: ProfileMenuItemData[] = [
    {
      id: "favorites",
      title: "Favorite Restaurants",
      subtitle: `${stats?.favoriteRestaurants ?? 0} restaurants`,
      icon: "heart-outline",
      iconColor: "#FF6B6B",
      onPress: () => router.push("/favorites"),
    },
    // {
    //   id: "notifications",
    //   title: "Notifications",
    //   subtitle: "Manage notification preferences",
    //   icon: "notifications-outline",
    //   iconColor: "#FFE66D",
    //   onPress: () =>
    //     Alert.alert("Notifications", "Notification settings screen"),
    // },
  ];

  const aiAssistantToggle: ProfileToggleItemData[] = [
    {
      id: "ai-assistant",
      title: "AI Food Assistant",
      subtitle: "Get personalized food recommendations",
      icon: "sparkles-outline",
      iconColor: "#4CAF50",
      value: aiChatEnabled,
      onToggle: (value) => dispatch(toggleAIChat(value)),
    },
  ];

  const supportSection: ProfileMenuItemData[] = [
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: "help-circle-outline",
      iconColor: "#3498DB",
      onPress: () => router.push("/help-support"),
    },
    // {
    //   id: "about",
    //   title: "About",
    //   subtitle: "App version and information",
    //   icon: "information-circle-outline",
    //   iconColor: "#95A5A6",
    //   onPress: () => Alert.alert("About", "About app screen"),
    // },
    // {
    //   id: "terms",
    //   title: "Terms of Service",
    //   subtitle: "Read our terms and conditions",
    //   icon: "document-text-outline",
    //   iconColor: "#8E44AD",
    //   onPress: () => resetOnboardingStatus(),
    // },
    {
      id: "logout",
      title: "Logout",
      subtitle: "Sign out of your account",
      icon: "log-out-outline",
      iconColor: "#E74C3C",
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={{ marginTop: 12 }}>Loading profile...</Text>
        </View>
      ) : error ? (
        <View style={{ padding: 20 }}>
          <Text style={{ color: "#FF4757", marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity
            onPress={fetchProfile}
            style={{ backgroundColor: "#22C55E", padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {user && (
            <ProfileHeader user={user} onEditPress={handleEditProfile} />
          )}

          {stats && <ProfileStats stats={stats} />}

          <ProfileSection title="Account" items={accountSection} />

          <ProfileSection title="Preferences" items={preferencesSection} />

          {/* AI Assistant Toggle */}
          <View style={{ marginTop: 16, backgroundColor: "#FFF" }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#757575",
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 8,
              }}
            >
              AI ASSISTANT
            </Text>
            {aiAssistantToggle.map((item) => (
              <ProfileToggleItem key={item.id} item={item} />
            ))}
          </View>

          <ProfileSection title="Support" items={supportSection} />
        </ScrollView>
      )}

      <EditProfileModal
        visible={editProfileModalVisible}
        user={user}
        onClose={() => setEditProfileModalVisible(false)}
        onSuccess={fetchProfile}
      />

      <ManageAddressesModal
        visible={manageAddressesModalVisible}
        onClose={() => setManageAddressesModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: -45,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
});
