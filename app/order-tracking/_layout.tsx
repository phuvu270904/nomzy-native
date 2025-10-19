import { Stack } from "expo-router";
import React from "react";

export default function OrderTrackingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[orderId]" />
    </Stack>
  );
}
