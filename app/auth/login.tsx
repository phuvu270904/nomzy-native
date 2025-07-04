import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
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

export default function PhoneLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleBack = () => {
    router.back();
  };

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
      const response = await apiClient.post("/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      const { jwt } = response.data;
      console.log(jwt, "Login token received");

      // Use the login method from useAuth to store credentials
      await login(jwt);

      // Navigate to the main app
      router.replace("/(tabs)");
    } catch (error: any) {
      console.log(error);
      const errorMessage =
        error.response?.data?.message || "Failed to sign in. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login pressed");
    // Implement Facebook login logic
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
    // Implement Google login logic
  };

  const handleAppleLogin = () => {
    console.log("Apple login pressed");
    // Implement Apple login logic
  };

  const handleSignUp = () => {
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
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.logoImage}
            />
          </View>

          {/* Title */}
          <ThemedText style={styles.title}>Login to Your Account</ThemedText>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Phone Number Input */}
            <View style={styles.inputContainer}>
              <View style={styles.textInputWrapper}>
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
                {isLoading ? "Signing in..." : "Sign in"}
              </ThemedText>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <ThemedText style={styles.dividerText}>
                or continue with
              </ThemedText>
            </View>

            {/* Social Login Icons */}
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

              <TouchableOpacity
                style={styles.socialIconButton}
                onPress={handleAppleLogin}
                activeOpacity={0.7}
              >
                <Ionicons name="logo-apple" size={24} color="#000" />
              </TouchableOpacity>
            </View>

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
    marginTop: 40,
    marginBottom: 40,
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
    marginBottom: 50,
    color: "#2E2E2E",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  formContainer: {
    paddingHorizontal: 24,
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
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#2E2E2E",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
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
  signInButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
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
  dividerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  dividerText: {
    fontSize: 14,
    color: "#9E9E9E",
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
  googleIcon: {
    width: 24,
    height: 24,
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
});
