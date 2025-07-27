import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface StatusToggleProps {
  isOnline: boolean;
  onStatusChange: (newStatus: boolean) => void;
}

export const StatusToggle = ({
  isOnline,
  onStatusChange,
}: StatusToggleProps) => {
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnimation, {
        toValue: isOnline ? 1 : 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }),
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isOnline, slideAnimation, scaleAnimation]);

  return (
    <View style={styles.statusCard}>
      <Animated.View
        style={[
          styles.statusToggleContainer,
          { transform: [{ scale: scaleAnimation }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.statusButton, styles.leftButton]}
          onPress={() => onStatusChange(false)}
        >
          <Text
            style={[
              styles.statusButtonText,
              !isOnline && styles.activeOfflineText,
            ]}
          >
            Offline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusButton, styles.rightButton]}
          onPress={() => onStatusChange(true)}
        >
          <Text
            style={[
              styles.statusButtonText,
              isOnline && styles.activeOnlineText,
            ]}
          >
            Online
          </Text>
        </TouchableOpacity>

        {/* Animated Indicator */}
        <Animated.View
          style={[
            styles.statusIndicator,
            {
              left: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["4%", "54%"],
              }),
              backgroundColor: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["#ff4e4e", "#4CAF50"],
              }),
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusCard: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  statusToggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 30,
    padding: 4,
    width: "80%",
    position: "relative",
  },
  statusIndicator: {
    position: "absolute",
    top: 4,
    width: "46%",
    height: "100%",
    borderRadius: 26,
    zIndex: -1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 26,
    zIndex: 1,
  },
  leftButton: {
    marginRight: 2,
  },
  rightButton: {
    marginLeft: 2,
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeOfflineText: {
    color: "#FFFFFF",
  },
  activeOnlineText: {
    color: "#FFFFFF",
  },
});
