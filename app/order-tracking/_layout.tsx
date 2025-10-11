import { Stack } from "expo-router";

export default function OrderTrackingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[orderId]" />
    </Stack>
  );
}
