import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTabId: string;
  onTabPress: (tabId: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTabId,
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTabId === tab.id && styles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <Text
            style={[
              styles.tabText,
              activeTabId === tab.id && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
          {activeTabId === tab.id && <View style={styles.indicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 4,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    position: "relative",
  },
  activeTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757575",
  },
  activeTabText: {
    color: "#1BAC4B",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: "#1BAC4B",
    borderRadius: 1,
  },
});

export default TabNavigation;
