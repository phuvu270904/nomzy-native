import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "@/api/authApi";
import { userVehiclesApi } from "@/api/userVehiclesApi";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/utils/apiClient";

type VehicleType = "Motorcycle" | "Car";

export default function DriverVehicleInfoScreen() {
  const params = useLocalSearchParams<{
    avatarUri: string;
    gender: string;
  }>();

  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [vehName, setVehName] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchUserProfile } = useAuth();

  const pickLicenseImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload your license."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLicenseImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const formData = new FormData();
      const filename = uri.split("/").pop() || "upload.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri,
        name: filename,
        type,
      } as any);

      const uploadResponse = await apiClient.post(
        "/upload/single",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return uploadResponse.data.data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleComplete = async () => {
    // Validation
    if (!vehicleType) {
      Alert.alert("Vehicle Type Required", "Please select your vehicle type.");
      return;
    }

    if (!vehName.trim()) {
      Alert.alert("Vehicle Name Required", "Please enter your vehicle name.");
      return;
    }

    if (!regNumber.trim()) {
      Alert.alert(
        "Registration Number Required",
        "Please enter your vehicle registration number."
      );
      return;
    }

    if (!licenseImage) {
      Alert.alert("License Required", "Please upload your driver's license.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Upload avatar to server
      const avatarUrl = await uploadImage(params.avatarUri);

      // Step 2: Upload license to server
      const licenseUrl = await uploadImage(licenseImage);

      // Step 3: Update user profile with avatar and gender
      await authApi.updateProfile({
        avatar: avatarUrl,
        gender: params.gender as "male" | "female",
      });

      // Step 4: Create user vehicle
      await userVehiclesApi.createUserVehicle({
        type: vehicleType,
        vehName: vehName.trim(),
        regNumber: regNumber.trim(),
        license: licenseUrl,
      });

      // Step 4.5: Mark user as fully registered
      await apiClient.post("/auth/updateProfile", {
            isFullyRegistered: true,
        });

      // Step 5: Fetch updated profile to ensure we have the latest data
      await fetchUserProfile();

      // Navigate to driver home
      Alert.alert(
        "Success",
        "Your profile has been completed successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/(driver-tabs)");
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Error completing profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to complete profile. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <ThemedText style={styles.title}>Vehicle Information</ThemedText>
          <ThemedText style={styles.subtitle}>
            Add your vehicle details to start accepting orders
          </ThemedText>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepContainer}>
              <View style={[styles.stepCircle, styles.stepCircleCompleted]}>
                <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.stepLabel}>Profile</ThemedText>
            </View>
            <View style={[styles.stepLine, styles.stepLineActive]} />
            <View style={styles.stepContainer}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <ThemedText style={styles.stepNumberActive}>2</ThemedText>
              </View>
              <ThemedText style={styles.stepLabel}>Vehicle</ThemedText>
            </View>
          </View>

          {/* Vehicle Type Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Vehicle Type</ThemedText>

            <View style={styles.vehicleTypeOptions}>
              <TouchableOpacity
                style={[
                  styles.vehicleTypeOption,
                  vehicleType === "Motorcycle" && styles.vehicleTypeOptionActive,
                ]}
                onPress={() => setVehicleType("Motorcycle")}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.vehicleIconContainer,
                    vehicleType === "Motorcycle" &&
                      styles.vehicleIconContainerActive,
                  ]}
                >
                  <Ionicons
                    name="bicycle"
                    size={32}
                    color={vehicleType === "Motorcycle" ? "#FFFFFF" : "#FF6B00"}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.vehicleTypeText,
                    vehicleType === "Motorcycle" &&
                      styles.vehicleTypeTextActive,
                  ]}
                >
                  Motorcycle
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.vehicleTypeOption,
                  vehicleType === "Car" && styles.vehicleTypeOptionActive,
                ]}
                onPress={() => setVehicleType("Car")}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.vehicleIconContainer,
                    vehicleType === "Car" && styles.vehicleIconContainerActive,
                  ]}
                >
                  <Ionicons
                    name="car"
                    size={32}
                    color={vehicleType === "Car" ? "#FFFFFF" : "#FF6B00"}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.vehicleTypeText,
                    vehicleType === "Car" && styles.vehicleTypeTextActive,
                  ]}
                >
                  Car
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Vehicle Name Input */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Vehicle Name</ThemedText>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="car-sport-outline"
                size={20}
                color="#9E9E9E"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Honda CBR, Toyota Camry"
                placeholderTextColor="#9E9E9E"
                value={vehName}
                onChangeText={setVehName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Registration Number Input */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Registration Number
            </ThemedText>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="card-outline"
                size={20}
                color="#9E9E9E"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="e.g. ABC-1234"
                placeholderTextColor="#9E9E9E"
                value={regNumber}
                onChangeText={setRegNumber}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* License Upload */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Driver's License</ThemedText>
            <TouchableOpacity
              style={styles.licenseUploadContainer}
              onPress={pickLicenseImage}
              activeOpacity={0.8}
            >
              {licenseImage ? (
                <Image
                  source={{ uri: licenseImage }}
                  style={styles.licenseImage}
                />
              ) : (
                <View style={styles.licensePlaceholder}>
                  <Ionicons name="document-outline" size={48} color="#9E9E9E" />
                  <ThemedText style={styles.licensePlaceholderText}>
                    Tap to upload license
                  </ThemedText>
                </View>
              )}
              <View style={styles.uploadIconContainer}>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[
              styles.completeButton,
              (!vehicleType ||
                !vehName.trim() ||
                !regNumber.trim() ||
                !licenseImage ||
                isLoading) &&
                styles.completeButtonDisabled,
            ]}
            onPress={handleComplete}
            disabled={
              !vehicleType ||
              !vehName.trim() ||
              !regNumber.trim() ||
              !licenseImage ||
              isLoading
            }
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.completeButtonText}>
                Complete Profile
              </ThemedText>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E2E2E",
    lineHeight: 32,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#9E9E9E",
    marginBottom: 30,
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    paddingHorizontal: 40,
  },
  stepContainer: {
    alignItems: "center",
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },
  stepCircleCompleted: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9E9E9E",
  },
  stepNumberActive: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  stepLabel: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "500",
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#E5E5E5",
    marginHorizontal: 8,
    marginBottom: 28,
  },
  stepLineActive: {
    backgroundColor: "#4CAF50",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 16,
  },
  vehicleTypeOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  vehicleTypeOption: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F8F8F8",
    borderWidth: 2,
    borderColor: "#F8F8F8",
  },
  vehicleTypeOptionActive: {
    backgroundColor: "#FFF4ED",
    borderColor: "#FF6B00",
  },
  vehicleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  vehicleIconContainerActive: {
    backgroundColor: "#FF6B00",
  },
  vehicleTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  vehicleTypeTextActive: {
    color: "#FF6B00",
  },
  inputWrapper: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2E2E2E",
  },
  licenseUploadContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8F8F8",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
  },
  licenseImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  licensePlaceholder: {
    width: "100%",
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  licensePlaceholderText: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 12,
  },
  uploadIconContainer: {
    position: "absolute",
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  completeButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
    shadowColor: "#FF6B00",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
