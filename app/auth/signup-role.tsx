import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "../../components/ThemedText";

type UserType = "User" | "Driver";

export default function SignUpRoleScreen() {
  const [selectedRole, setSelectedRole] = useState<UserType | null>(null);
  
  // Animation refs
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  const handleBack = () => {
    router.back();
  };

  const handleRoleSelect = (role: UserType) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (!selectedRole) return;
    
    // Navigate to email screen with selected role
    router.push({
      pathname: "/auth/signup-email",
      params: { userType: selectedRole },
    });
  };

  // Animate tab change
  useEffect(() => {
    if (selectedRole) {
      Animated.parallel([
        Animated.spring(slideAnimation, {
          toValue: selectedRole === "Driver" ? 1 : 0,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [selectedRole, slideAnimation, scaleAnimation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="people-outline" size={64} color="#4CAF50" />
            </View>
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>Join as a User or Driver?</ThemedText>
          <ThemedText style={styles.subtitle}>
            Choose the account type that best fits your needs
          </ThemedText>

          {/* Role Selector */}
          <View style={styles.roleContainerWrapper}>
            <Animated.View
              style={[
                styles.roleContainer,
                { transform: [{ scale: scaleAnimation }] },
              ]}
            >
              <TouchableOpacity
                style={[styles.roleButton, styles.leftButton]}
                onPress={() => handleRoleSelect("User")}
                activeOpacity={0.8}
              >
                <View style={styles.roleContent}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedRole === "User" && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedRole === "User" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Ionicons
                    name="person-outline"
                    size={40}
                    color={selectedRole === "User" ? "#4CAF50" : "#9E9E9E"}
                    style={styles.roleIcon}
                  />
                  <ThemedText
                    style={[
                      styles.roleText,
                      selectedRole === "User" && styles.activeRoleText,
                    ]}
                  >
                    User
                  </ThemedText>
                  <ThemedText style={styles.roleDescription}>
                    Order food and get it delivered
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, styles.rightButton]}
                onPress={() => handleRoleSelect("Driver")}
                activeOpacity={0.8}
              >
                <View style={styles.roleContent}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedRole === "Driver" && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedRole === "Driver" && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Ionicons
                    name="car-outline"
                    size={40}
                    color={selectedRole === "Driver" ? "#FF6B00" : "#9E9E9E"}
                    style={styles.roleIcon}
                  />
                  <ThemedText
                    style={[
                      styles.roleText,
                      selectedRole === "Driver" && styles.activeDriverRoleText,
                    ]}
                  >
                    Driver
                  </ThemedText>
                  <ThemedText style={styles.roleDescription}>
                    Deliver food and earn money
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!selectedRole}
          >
            <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Sign In Link */}
          <View style={styles.signInContainer}>
            <ThemedText style={styles.signInText}>
              Already have an account?{" "}
            </ThemedText>
            <TouchableOpacity onPress={() => router.navigate("/auth")}>
              <ThemedText style={styles.signInLink}>Sign in</ThemedText>
            </TouchableOpacity>
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
  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F8F4",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#2E2E2E",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
    lineHeight: 24,
  },
  roleContainerWrapper: {
    alignItems: "center",
    marginBottom: 40,
  },
  roleContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 16,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  leftButton: {
    marginRight: 8,
  },
  rightButton: {
    marginLeft: 8,
  },
  roleContent: {
    alignItems: "center",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D0D0D0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  radioOuterSelected: {
    borderColor: "#4CAF50",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  roleIcon: {
    marginBottom: 12,
  },
  roleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#666",
    marginBottom: 8,
  },
  activeRoleText: {
    color: "#4CAF50",
  },
  activeDriverRoleText: {
    color: "#FF6B00",
  },
  roleDescription: {
    fontSize: 14,
    color: "#9E9E9E",
    textAlign: "center",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
    shadowColor: "#4CAF50",
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
    backgroundColor: "#B0BEC5",
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signInText: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  signInLink: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
