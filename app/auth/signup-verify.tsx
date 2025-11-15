import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "@/api/authApi";
import { ThemedText } from "../../components/ThemedText";

export default function SignUpVerifyScreen() {
  const { email, userType } = useLocalSearchParams<{ email: string; userType: string }>();
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleBack = () => {
    router.back();
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    try {
      await authApi.sendVerificationCode({ email });
      Alert.alert("Success", "Verification code has been resent to your email");
      setCountdown(60);
      setCanResend(false);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to resend verification code. Please try again."
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert("Error", "Verification code must be 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      // Call verify-email API
      await authApi.verifyEmail({
        email,
        code: verificationCode,
      });

      // Navigate to details screen with email, verification code, and userType
      router.push({
        pathname: "/auth/signup-details",
        params: { email, verificationCode, userType },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Invalid verification code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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

          {/* Content */}
          <View style={styles.content}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconWrapper}>
                <Ionicons name="shield-checkmark-outline" size={64} color="#4CAF50" />
              </View>
            </View>

            {/* Title */}
            <ThemedText style={styles.title}>Verify your email</ThemedText>
            <ThemedText style={styles.subtitle}>
              We've sent a 6-digit code to{"\n"}
              <ThemedText style={styles.emailText}>{email}</ThemedText>
            </ThemedText>

            {/* Verification Code Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#9E9E9E"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor="#9E9E9E"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  autoFocus
                />
              </View>
            </View>

            {/* Resend Button */}
            <View style={styles.resendContainer}>
              <ThemedText style={styles.resendText}>
                Didn't receive the code?{" "}
              </ThemedText>
              <TouchableOpacity
                onPress={handleResend}
                disabled={!canResend || isResending}
              >
                <ThemedText
                  style={[
                    styles.resendLink,
                    (!canResend || isResending) && styles.resendLinkDisabled,
                  ]}
                >
                  {isResending
                    ? "Sending..."
                    : canResend
                    ? "Resend"
                    : `Resend in ${countdown}s`}
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyButton,
                isLoading && styles.verifyButtonDisabled,
              ]}
              onPress={handleVerify}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <ThemedText style={styles.verifyButtonText}>
                {isLoading ? "Verifying..." : "Verify"}
              </ThemedText>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </TouchableOpacity>
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
    lineHeight: 32,
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
  emailText: {
    fontWeight: "600",
    color: "#4CAF50",
  },
  inputContainer: {
    marginBottom: 20,
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
    letterSpacing: 4,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  resendText: {
    fontSize: 14,
    color: "#9E9E9E",
  },
  resendLink: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  resendLinkDisabled: {
    color: "#CCCCCC",
  },
  verifyButton: {
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
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
});
