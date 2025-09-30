import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar: string;
  memberSince?: string;
  verified?: boolean;
}

interface ProfileHeaderProps {
  user: UserProfile;
  onEditPress?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          {user.verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        {onEditPress && (
          <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
            <Ionicons name="pencil" size={16} color="#1BAC4B" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        {user.memberSince && (
          <Text style={styles.memberSince}>
            Member since {user.memberSince}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatarSection: {
    position: "relative",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#F5F5F5",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1BAC4B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 12,
    color: "#9E9E9E",
    fontStyle: "italic",
  },
});

export default ProfileHeader;
