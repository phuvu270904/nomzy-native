import { useAuth } from "@/hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
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

  const [driverInfo, setDriverInfo] = useState({
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    vehicleType: "Motorcycle",
    licensePlate: "ABC-123",
    rating: 4.8,
    totalDeliveries: 1247,
    joinDate: "March 2023",
    profileImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=center",
  });

  const [notifications, setNotifications] = useState({
    orderAlerts: true,
    promotions: false,
    earnings: true,
    newFeatures: true,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  const menuItems = [
    {
      id: 1,
      title: "Vehicle Information",
      icon: "car-outline",
      onPress: () => console.log("Vehicle info"),
    },
    {
      id: 2,
      title: "Payment Methods",
      icon: "card-outline",
      onPress: () => console.log("Payment methods"),
    },
    {
      id: 3,
      title: "Order History",
      icon: "time-outline",
      onPress: () => console.log("Order history"),
    },
    {
      id: 4,
      title: "Earnings Report",
      icon: "analytics-outline",
      onPress: () => console.log("Earnings report"),
    },
    {
      id: 5,
      title: "Help & Support",
      icon: "help-circle-outline",
      onPress: () => console.log("Help & Support"),
    },
    {
      id: 6,
      title: "Terms & Conditions",
      icon: "document-text-outline",
      onPress: () => console.log("Terms & Conditions"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: driverInfo.profileImage }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.driverName}>{driverInfo.name}</Text>
              <Text style={styles.driverEmail}>{driverInfo.email}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{driverInfo.rating}</Text>
                <Text style={styles.deliveries}>
                  • {driverInfo.totalDeliveries} deliveries
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleRow}>
              <Ionicons name="bicycle-outline" size={20} color="#666" />
              <Text style={styles.vehicleText}>{driverInfo.vehicleType}</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Ionicons name="car-outline" size={20} color="#666" />
              <Text style={styles.vehicleText}>{driverInfo.licensePlate}</Text>
            </View>
            <View style={styles.vehicleRow}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.vehicleText}>
                Joined {driverInfo.joinDate}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsCard}>
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
        </View>

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
