import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { Provider, useDispatch, useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { store } from '@/store/store';
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
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const dispatch = useDispatch();
  const isOnboardingComplete = useSelector((state: any) => state.onboarding.isComplete);

  // Only check onboarding status once during initial load
  useEffect(() => {
    const { checkOnboardingStatus } = require('../store/slices/onboardingSlice');
    dispatch(checkOnboardingStatus());
  }, [dispatch]); 

  if (!loaded) {
    // Only wait for fonts to load
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 10 }}>Loading fonts...</ThemedText>
      </View>
    );
  }
  
  // Conditionally rendering different navigation stacks based on the onboarding state
  return (
    <ThemeProvider value={DefaultTheme}>
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
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
