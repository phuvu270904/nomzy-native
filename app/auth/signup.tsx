import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import apiClient from "@/utils/apiClient";
import { ThemedText } from "../../components/ThemedText";

Dimensions.get("window");

type UserType = "User" | "Driver";

export default function SignUpScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserType>("User");

  const handleBack = () => {
    router.back();
  };

  const handleSignUp = async () => {
    if (!phoneNumber.trim() || !email.trim() || !fullName.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "User") {
        await apiClient.post("/auth/registerUser", {
          phone_number: phoneNumber,
          email,
          name: fullName,
          password,
        });
      } else {
        await apiClient.post("/auth/registerDriver", {
          phone_number: phoneNumber,
          email,
          name: fullName,
          password,
        });
      }

      router.navigate("/auth/login");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignUp = () => {
    console.log("Facebook sign up pressed");
    // Implement Facebook sign up logic
  };

  const handleGoogleSignUp = () => {
    console.log("Google sign up pressed");
    // Implement Google sign up logic
  };

  const handleAppleSignUp = () => {
    console.log("Apple sign up pressed");
    // Implement Apple sign up logic
  };

  const handleSignIn = () => {
    console.log("Sign in pressed");
    router.navigate("/auth/login");
  };

  const handleTabPress = (tab: UserType) => {
    setActiveTab(tab);
  };

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
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          {/* <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <View style={styles.logo}>
                <Image 
                  source={require('../../assets/images/icon.png')} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.speedLines}>
                <View style={[styles.speedLine, styles.speedLine1]} />
                <View style={[styles.speedLine, styles.speedLine2]} />
                <View style={[styles.speedLine, styles.speedLine3]} />
              </View>
            </View>
          </View> */}

          {/* Title */}
          <ThemedText style={styles.title}>Create New Account</ThemedText>

          {/* Tab Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "User" && styles.activeTabButton,
              ]}
              onPress={() => handleTabPress("User")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={activeTab === "User" ? "#FFFFFF" : "#9E9E9E"}
                style={styles.tabIcon}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "User" && styles.activeTabText,
                ]}
              >
                User
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === "Driver" && styles.activeTabButton,
              ]}
              onPress={() => handleTabPress("Driver")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="car-outline"
                size={20}
                color={activeTab === "Driver" ? "#FFFFFF" : "#9E9E9E"}
                style={styles.tabIcon}
              />
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "Driver" && styles.activeTabText,
                ]}
              >
                Driver
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#9E9E9E"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name"
                  placeholderTextColor="#9E9E9E"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#9E9E9E"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email"
                  placeholderTextColor="#9E9E9E"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#9E9E9E"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#9E9E9E"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <View style={styles.phoneInputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#9E9E9E"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#9E9E9E"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Remember Me Checkbox */}
            {/* <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={toggleRememberMe}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
              >
                {rememberMe && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <ThemedText style={styles.checkboxLabel}>Remember me</ThemedText>
            </TouchableOpacity> */}

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.signUpButton,
                isLoading && styles.signUpButtonDisabled,
              ]}
              onPress={handleSignUp}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <ThemedText style={styles.signUpButtonText}>
                {isLoading ? "Creating Account..." : `Sign up as ${activeTab}`}
              </ThemedText>
            </TouchableOpacity>

            {/* Divider */}
            {activeTab === "User" && (
              <View style={styles.dividerContainer}>
                <ThemedText style={styles.dividerText}>
                  or continue with
                </ThemedText>
              </View>
            )}

            {/* Social Login Icons */}
            {activeTab === "User" && (
              <View style={styles.socialIconsContainer}>
                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={handleFacebookSignUp}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.socialIconButton}
                  onPress={handleGoogleSignUp}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-google" size={24} color="#EC4436" />
                </TouchableOpacity>

                {Platform.OS === "ios" && (
                  <TouchableOpacity
                    style={styles.socialIconButton}
                    onPress={handleAppleSignUp}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-apple" size={24} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Sign In Link */}
            <View style={styles.signInContainer}>
              <ThemedText style={styles.signInText}>
                Already have an account?{" "}
              </ThemedText>
              <TouchableOpacity onPress={handleSignIn}>
                <ThemedText style={styles.signInLink}>Sign in</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  logoWrapper: {
    position: "relative",
    alignItems: "center",
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  speedLines: {
    position: "absolute",
    left: -30,
    top: "50%",
    marginTop: -10,
  },
  speedLine: {
    backgroundColor: "#4CAF50",
    borderRadius: 2,
    marginBottom: 4,
  },
  speedLine1: {
    width: 20,
    height: 4,
  },
  speedLine2: {
    width: 16,
    height: 4,
  },
  speedLine3: {
    width: 12,
    height: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#2E2E2E",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginHorizontal: 24,
    marginBottom: 20,
    paddingVertical: 8,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: "#4CAF50",
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#9E9E9E",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  formContainer: {
    paddingHorizontal: 24,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  phoneInputWrapper: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#E5E5E5",
  },
  flagIcon: {
    width: 24,
    height: 16,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#2E2E2E",
  },
  inputWrapper: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#2E2E2E",
  },
  signUpButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
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
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  dividerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  dividerText: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  socialIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
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
