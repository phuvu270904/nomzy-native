import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { getOnboardingStatus } from '@/utils/onboarding';
import "../global.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Only check onboarding status once during initial load
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        // Use a simpler approach - look for the key directly
        const isCompleted = await getOnboardingStatus();
        console.log("Initial onboarding check:", isCompleted);
        setIsOnboardingComplete(isCompleted);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsOnboardingComplete(false);
      } finally {
        // Always set loading to false when done
        setIsLoading(false);
      }
    }

    checkOnboardingStatus();
  }, []); // Empty dependency array ensures this only runs once

  if (!loaded) {
    // Only wait for fonts to load
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 10 }}>Loading fonts...</ThemedText>
      </View>
    );
  }
  
  // This is the critical change - we're not using redirection anymore, but conditionally
  // rendering different navigation stacks based on the onboarding state

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isOnboardingComplete ? (
          // Main app screens when onboarding is complete
          <Stack.Screen name="(tabs)" />
        ) : (
          // Onboarding screen when onboarding is not complete
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );

}
