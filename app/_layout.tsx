import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-reanimated";
import { Provider, useDispatch, useSelector } from "react-redux";

import { ThemedText } from "@/components/ThemedText";
import { store } from "@/store/store";
import "../global.css";

// Root layout wrapper that provides Redux store
export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

// Navigation component that uses Redux
function RootLayoutNav() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router = useRouter();
  const dispatch = useDispatch();
  const isOnboardingComplete = useSelector(
    (state: any) => state.onboarding.isComplete,
  );
  const isLoading = useSelector((state: any) => state.onboarding.isLoading);

  // Only check onboarding status once during initial load
  useEffect(() => {
    const checkStatus = async () => {
      const {
        checkOnboardingStatus,
      } = require("../store/slices/onboardingSlice");
      await dispatch(checkOnboardingStatus());
    };

    checkStatus();
  }, [dispatch]);

  // Navigate based on onboarding status once loading is complete
  useEffect(() => {
    if (!isLoading && loaded) {
      if (isOnboardingComplete) {
        router.replace("/auth");
      } else {
        router.replace("/onboarding");
      }
    }
  }, [isOnboardingComplete, isLoading, loaded, router]);

  if (!loaded || isLoading) {
    // Wait for fonts to load AND onboarding status check to complete
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 10 }}>Loading...</ThemedText>
      </View>
    );
  }

  // Render navigation structure
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="auth" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="carts" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
