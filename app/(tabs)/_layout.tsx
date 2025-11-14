import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

import { AIChatContainer } from "@/components/ai-chat";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useOrderSocket } from "@/hooks/useOrderSocket";

export default function TabLayout() {
  // Initialize order socket connection when user enters tabs (logged in)
  const { isConnected, isConnecting, connect } = useOrderSocket();

  useEffect(() => {
    connect();
    console.log("TabLayout mounted - Order socket connection status:", {
      isConnected,
      isConnecting,
    });
  }, [isConnected, isConnecting]);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#4CAF50", // Green color for active tab
          tabBarInactiveTintColor: "#9E9E9E", // Gray color for inactive tabs
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#F0F0F0",
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
            paddingTop: 10,
            height: 90,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
            marginTop: 4,
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "list" : "list-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Message",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble" : "chatbubble-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>

    {/* AI Chat Bubble - Appears on all tabs */}
    <AIChatContainer />
  </>
  );
}
