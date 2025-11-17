import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";

export default function DriverFillProfileScreen() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload an avatar."
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images" as any,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleContinue = () => {
    if (!avatar) {
      Alert.alert("Avatar Required", "Please upload your profile picture.");
      return;
    }

    if (!gender) {
      Alert.alert("Gender Required", "Please select your gender.");
      return;
    }

    // Store data temporarily and navigate to vehicle info screen
    router.push({
      pathname: "/driver-fill-profile/vehicle-info",
      params: {
        avatarUri: avatar,
        gender: gender,
      },
    });
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
          <ThemedText style={styles.title}>Fill Your Profile</ThemedText>
          <ThemedText style={styles.subtitle}>
            Let's complete your driver profile to get started
          </ThemedText>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={styles.stepContainer}>
              <View style={[styles.stepCircle, styles.stepCircleActive]}>
                <ThemedText style={styles.stepNumberActive}>1</ThemedText>
              </View>
              <ThemedText style={styles.stepLabel}>Profile</ThemedText>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepContainer}>
              <View style={styles.stepCircle}>
                <ThemedText style={styles.stepNumber}>2</ThemedText>
              </View>
              <ThemedText style={styles.stepLabel}>Vehicle</ThemedText>
            </View>
          </View>

          {/* Avatar Upload */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="camera" size={40} color="#9E9E9E" />
                </View>
              )}
              <View style={styles.editIconContainer}>
                <Ionicons name="pencil" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <ThemedText style={styles.avatarText}>
              Upload Profile Picture
            </ThemedText>
          </View>

          {/* Gender Selection */}
          <View style={styles.genderSection}>
            <ThemedText style={styles.sectionTitle}>Select Gender</ThemedText>

            <View style={styles.genderOptions}>
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === "male" && styles.genderOptionActive,
                ]}
                onPress={() => setGender("male")}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.genderIconContainer,
                    gender === "male" && styles.genderIconContainerActive,
                  ]}
                >
                  <Ionicons
                    name="male"
                    size={32}
                    color={gender === "male" ? "#FFFFFF" : "#FF6B00"}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.genderText,
                    gender === "male" && styles.genderTextActive,
                  ]}
                >
                  Male
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.genderOption,
                  gender === "female" && styles.genderOptionActive,
                ]}
                onPress={() => setGender("female")}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.genderIconContainer,
                    gender === "female" && styles.genderIconContainerActive,
                  ]}
                >
                  <Ionicons
                    name="female"
                    size={32}
                    color={gender === "female" ? "#FFFFFF" : "#FF6B00"}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.genderText,
                    gender === "female" && styles.genderTextActive,
                  ]}
                >
                  Female
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!avatar || !gender || isLoading) &&
                styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!avatar || !gender || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.continueButtonText}>
                Continue
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
  avatarSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarText: {
    fontSize: 16,
    color: "#2E2E2E",
    fontWeight: "500",
  },
  genderSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 20,
  },
  genderOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  genderOption: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#F8F8F8",
    borderWidth: 2,
    borderColor: "#F8F8F8",
  },
  genderOptionActive: {
    backgroundColor: "#FFF4ED",
    borderColor: "#FF6B00",
  },
  genderIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  genderIconContainerActive: {
    backgroundColor: "#FF6B00",
  },
  genderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  genderTextActive: {
    color: "#FF6B00",
  },
  continueButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#FF6B00",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
