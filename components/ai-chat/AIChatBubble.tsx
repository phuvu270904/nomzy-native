import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Animated,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";

interface AIChatBubbleProps {
  onPress: () => void;
  isVisible: boolean;
}

export const AIChatBubble: React.FC<AIChatBubbleProps> = ({
  onPress,
  isVisible,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.bubble,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={12} color="#FFD700" />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 110 : 100,
    right: 20,
    zIndex: 1000,
  },
  bubble: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
