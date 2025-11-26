import { authApi, UserProfileResponse } from "@/api/authApi";
import { calculateAverageRating, DriverReview, driverReviewsApi } from "@/api/driverReviewsApi";
import { ApiOrder, ordersApi } from "@/api/ordersApi";
import { UserVehicle, userVehiclesApi } from "@/api/userVehiclesApi";
import { DriverChangePasswordModal, DriverEditProfileModal } from "@/components/driver";
import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const DriverProfileScreen = () => {
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [reviews, setReviews] = useState<DriverReview[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

  const fetchDriverData = async () => {
    try {
      setError(null);
      
      // Fetch all data in parallel
      const [profileRes, reviewsRes, ordersRes, vehiclesRes] = await Promise.all([
        authApi.getProfile(),
        driverReviewsApi.getDriverReviews(),
        ordersApi.getDriverOrders(),
        userVehiclesApi.getUserVehicles(),
      ]);

      setProfile(profileRes.user);
      setReviews(reviewsRes);
      setOrders(ordersRes);
      setVehicles(vehiclesRes);
    } catch (err: any) {
      console.error("Error fetching driver data:", err);
      setError(err.response?.data?.message || "Failed to load profile data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDriverData();
  };

  // Calculate stats from real data
  const averageRating = calculateAverageRating(reviews);
  const totalDeliveries = orders.filter(order => order.status === "delivered").length;
  const joinDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "N/A";
  
  // Get primary vehicle
  const primaryVehicle = vehicles.length > 0 ? vehicles[0] : null;

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

  const menuItems = [
    {
      id: 1,
      title: "Edit Profile",
      icon: "person-outline",
      onPress: handleEditProfile,
    },
    {
      id: 2,
      title: "Change Password",
      icon: "lock-closed-outline",
      onPress: () => setChangePasswordModalVisible(true),
    },
    {
      id: 3,
      title: "Vehicle Information",
      icon: "car-outline",
      onPress: () => router.push("/driver-vehicle-info"),
    },
    // {
    //   id: 4,
    //   title: "Payment Methods",
    //   icon: "card-outline",
    //   onPress: () => console.log("Payment methods"),
    // },
    // {
    //   id: 5,
    //   title: "Order History",
    //   icon: "time-outline",
    //   onPress: () => router.push("/driver-order-history"),
    // },
    // {
    //   id: 6,
    //   title: "Earnings Report",
    //   icon: "analytics-outline",
    //   onPress: () => router.push("/driver-earnings-report"),
    // },
    {
      id: 7,
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => router.push("/driver-help-support"),
    },
    // {
    //   id: 8,
    //   title: "Terms & Conditions",
    //   icon: "document-text-outline",
    //   onPress: () => console.log("Terms & Conditions"),
    // },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
        }
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {profile?.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Ionicons name="person" size={40} color="#999" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.driverName}>{profile?.name || "Driver"}</Text>
              <Text style={styles.driverEmail}>{profile?.email || "N/A"}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                </Text>
                <Text style={styles.deliveries}>
                  • {totalDeliveries} deliveries
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleRow}>
              <Ionicons name="bicycle-outline" size={20} color="#666" />
              <Text style={styles.vehicleText}>
                {primaryVehicle?.type || "No vehicle"}
              </Text>
            </View>
            {primaryVehicle && (
              <>
                <View style={styles.vehicleRow}>
                  <Ionicons name="car-outline" size={20} color="#666" />
                  <Text style={styles.vehicleText}>
                    {primaryVehicle.vehName} - {primaryVehicle.regNumber}
                  </Text>
                </View>
              </>
            )}
            <View style={styles.vehicleRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.vehicleText}>
                Joined {joinDate}
              </Text>
            </View>
            {profile?.phone_number && (
              <View style={styles.vehicleRow}>
                <Ionicons name="call-outline" size={20} color="#666" />
                <Text style={styles.vehicleText}>
                  {profile.phone_number}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Quick Stats */}
        {/* <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Acceptance Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.5min</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>On-time Rate</Text>
            </View>
          </View>
        </View> */}

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color="#666" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color="#CCC" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF5722" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <DriverEditProfileModal
        visible={editProfileModalVisible}
        profile={profile}
        onClose={() => setEditProfileModalVisible(false)}
        onSuccess={fetchDriverData}
      />

      <DriverChangePasswordModal
        visible={changePasswordModalVisible}
        onClose={() => setChangePasswordModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
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
    marginTop: 16,
    fontSize: 16,
    color: "#FF5722",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  driverEmail: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  deliveries: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  vehicleInfo: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
    gap: 12,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  vehicleText: {
    fontSize: 14,
    color: "#333",
  },
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  notificationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF5722",
  },
});

export default DriverProfileScreen;
