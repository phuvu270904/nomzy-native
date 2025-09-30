import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ProfileHeader,
  ProfileMenuItemData,
  ProfileSection,
  ProfileStats,
  ProfileStatsData,
  UserProfile,
} from "@/components/profile";
import { useAuth } from "@/hooks";

// Mock user data
const mockUser: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: "https://via.placeholder.com/80",
  memberSince: "January 2023",
  verified: true,
};

const mockStats: ProfileStatsData = {
  totalOrders: 47,
  favoriteRestaurants: 12,
  reviews: 23,
  points: 1250,
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [user] = useState<UserProfile>(mockUser);
  const [stats] = useState<ProfileStatsData>(mockStats);

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
    Alert.alert(
      "Edit Profile",
      "Edit profile functionality would be implemented here",
    );
  };

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
    {
      id: "payment-methods",
      title: "Payment Methods",
      subtitle: "Manage your payment options",
      icon: "card-outline",
      iconColor: "#4ECDC4",
      onPress: () => Alert.alert("Payment Methods", "Payment methods screen"),
    },
    {
      id: "addresses",
      title: "My Addresses",
      subtitle: "Delivery addresses",
      icon: "location-outline",
      iconColor: "#FF6B6B",
      onPress: () => Alert.alert("Addresses", "Address management screen"),
    },
  ];

  const preferencesSection: ProfileMenuItemData[] = [
    {
      id: "favorites",
      title: "Favorite Restaurants",
      subtitle: `${stats.favoriteRestaurants} restaurants`,
      icon: "heart-outline",
      iconColor: "#FF6B6B",
      onPress: () => Alert.alert("Favorites", "Favorite restaurants screen"),
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      icon: "notifications-outline",
      iconColor: "#FFE66D",
      onPress: () =>
        Alert.alert("Notifications", "Notification settings screen"),
    },
    {
      id: "language",
      title: "Language",
      subtitle: "English",
      icon: "language-outline",
      iconColor: "#9B59B6",
      onPress: () => Alert.alert("Language", "Language selection screen"),
    },
  ];

  const supportSection: ProfileMenuItemData[] = [
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: "help-circle-outline",
      iconColor: "#3498DB",
      onPress: () => Alert.alert("Help", "Help and support screen"),
    },
    {
      id: "about",
      title: "About",
      subtitle: "App version and information",
      icon: "information-circle-outline",
      iconColor: "#95A5A6",
      onPress: () => Alert.alert("About", "About app screen"),
    },
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader user={user} onEditPress={handleEditProfile} />

        <ProfileStats stats={stats} />

        <ProfileSection title="Account" items={accountSection} />

        <ProfileSection title="Preferences" items={preferencesSection} />

        <ProfileSection title="Support" items={supportSection} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: -45,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
});
