import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
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

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/utils/apiClient";

const { width } = Dimensions.get("window");

type UserType = "User" | "Driver";

const AUTH_TOKEN_KEY = "auth_token";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserType>("User");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { login } = useAuth();

  // Check if user is already authenticated and redirect to home
  useEffect(() => {
    const checkAuthToken = async () => {
      try {
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
        if (token) {
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking auth token:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthToken();
  }, []);

  // Show loading while checking authentication status
  if (isCheckingAuth) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const handleSignIn = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === "User") {
        const response = await apiClient.post("/auth/login/user", {
          email: email.trim(),
          password: password.trim(),
        });

        const { jwt } = response.data;

        await login(jwt);

        // Navigate to the main app
        router.replace("/(tabs)");
      } else {
        const response = await apiClient.post("/auth/login/driver", {
          email: email.trim(),
          password: password.trim(),
        });

        const { jwt } = response.data;

        await login(jwt);

        // Navigate to the main app
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message || "Failed to sign in. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabPress = (tab: UserType) => {
    setActiveTab(tab);
  };

  const handleSignUp = () => {
    console.log("Sign up pressed");
    // Navigate to sign up screen
    router.navigate("/auth/signup");
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
          {/* Main content */}
          <View style={styles.content}>
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                source={require("../../assets/images/onboarding/onboarding-1.png")}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            {/* Title */}
            <ThemedText style={styles.title}>Let&apos;s you in</ThemedText>

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
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.textInputWrapper}>
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
                    autoComplete="email"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.textInputWrapper}>
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

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.signInButton,
                  isLoading && styles.signInButtonDisabled,
                ]}
                onPress={handleSignIn}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <ThemedText style={styles.signInButtonText}>
                  {isLoading ? "Signing in..." : `Sign in as ${activeTab}`}
                </ThemedText>
              </TouchableOpacity>

              {/* Divider */}
              {/* {activeTab === "User" && (
                <View style={styles.dividerContainer}>
                  <ThemedText style={styles.dividerText}>
                    or continue with
                  </ThemedText>
                </View>
              )} */}

              {/* Social Login Icons */}
              {/* {activeTab === "User" && (
                <View style={styles.socialIconsContainer}>
                  <TouchableOpacity
                    style={styles.socialIconButton}
                    onPress={handleFacebookLogin}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.socialIconButton}
                    onPress={handleGoogleLogin}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="logo-google" size={24} color="#EC4436" />
                  </TouchableOpacity>

                  {Platform.OS === "ios" && (
                    <TouchableOpacity
                      style={styles.socialIconButton}
                      onPress={handleAppleLogin}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="logo-apple" size={24} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
              )} */}

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <ThemedText style={styles.signUpText}>
                  Don&apos;t have an account?{" "}
                </ThemedText>
                <TouchableOpacity onPress={handleSignUp}>
                  <ThemedText style={styles.signUpLink}>Sign up</ThemedText>
                </TouchableOpacity>
              </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "500",
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  illustrationContainer: {
    alignItems: "center",
  },
  illustration: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 250,
    maxHeight: 250,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 40,
    color: "#2E2E2E",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F8F8F8",
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
    paddingHorizontal: 0,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 30,
  },
  textInputWrapper: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginVertical: 10,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2E2E2E",
  },
  signInButton: {
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
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  socialButtonsContainer: {
    marginBottom: 30,
  },
  socialButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  socialButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2E2E2E",
    marginLeft: 5,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#9E9E9E",
  },
  phoneButton: {
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
  phoneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  signUpText: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  signUpLink: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
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
});
