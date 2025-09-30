import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ProfileMenuItem, { ProfileMenuItemData } from "./ProfileMenuItem";

interface ProfileSectionProps {
  title?: string;
  items: ProfileMenuItemData[];
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.itemsContainer}>
        {items.map((item) => (
          <ProfileMenuItem key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  itemsContainer: {
    backgroundColor: "#FFFFFF",
  },
});

export default ProfileSection;
