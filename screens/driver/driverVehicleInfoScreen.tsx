import { UserVehicle, userVehiclesApi } from "@/api/userVehiclesApi";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
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

const DriverVehicleInfoScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      setError(null);
      const vehiclesData = await userVehiclesApi.getUserVehicles();
      setVehicles(vehiclesData);
    } catch (err: any) {
      console.error("Error fetching vehicles:", err);
      setError(err.response?.data?.message || "Failed to load vehicle information");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehicles();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Information</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading vehicles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vehicle Information</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF5722" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchVehicles}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Information</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4CAF50"]} />
        }
      >
        {vehicles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="car-outline" size={64} color="#CCC" />
            <Text style={styles.emptyText}>No vehicles registered</Text>
            <Text style={styles.emptySubText}>
              Add your vehicle information to start delivering
            </Text>
          </View>
        ) : (
          vehicles.map((vehicle, index) => (
            <View key={vehicle.id} style={styles.vehicleCard}>
              <View style={styles.vehicleBadge}>
                <Ionicons 
                  name={vehicle.type.toLowerCase() === "motorcycle" ? "bicycle" : "car"} 
                  size={32} 
                  color="#4CAF50" 
                />
              </View>

              <View style={styles.vehicleDetails}>
                <View style={styles.vehicleHeader}>
                  <Text style={styles.vehicleType}>{vehicle.type}</Text>
                  {index === 0 && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryText}>Primary</Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="car-outline" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Vehicle Name</Text>
                    <Text style={styles.infoValue}>{vehicle.vehName}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="card-outline" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Registration Number</Text>
                    <Text style={styles.infoValue}>{vehicle.regNumber}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Registered On</Text>
                    <Text style={styles.infoValue}>{formatDate(vehicle.createdAt)}</Text>
                  </View>
                </View>

                {vehicle.license && (
                  <View style={styles.licenseSection}>
                    <Text style={styles.licenseLabel}>License Document</Text>
                    <Image 
                      source={{ uri: vehicle.license }} 
                      style={styles.licenseImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </View>
          ))
        )}
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  placeholder: {
    width: 40,
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  vehicleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  vehicleBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  vehicleDetails: {
    gap: 16,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  vehicleType: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  primaryBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  licenseSection: {
    marginTop: 8,
  },
  licenseLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  licenseImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
});

export default DriverVehicleInfoScreen;
