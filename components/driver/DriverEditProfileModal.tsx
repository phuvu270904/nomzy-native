import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { authApi, UpdateProfileRequest, UserProfileResponse } from "@/api/authApi";
import { uploadApi } from "@/api/uploadApi";

interface DriverEditProfileModalProps {
  visible: boolean;
  profile: UserProfileResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

const DriverEditProfileModal: React.FC<DriverEditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(profile?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number || "");
  const [gender, setGender] = useState<"male" | "female" | "other">(
    (profile?.gender as "male" | "female" | "other") || "male"
  );
  const [avatar, setAvatar] = useState(profile?.avatar || "");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhoneNumber(profile.phone_number || "");
      setGender((profile.gender as "male" | "female" | "other") || "male");
      setAvatar(profile.avatar || "");
      setSelectedImage(null);
    }
  }, [profile]);

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to access your photos"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;

    try {
      setUploadingImage(true);

      // Get file extension from URI
      const uriParts = selectedImage.split(".");
      const fileExtension = uriParts[uriParts.length - 1];
      const fileName = `avatar_${Date.now()}.${fileExtension}`;

      // Determine MIME type
      let mimeType = "image/jpeg";
      if (fileExtension === "png") mimeType = "image/png";
      else if (fileExtension === "jpg" || fileExtension === "jpeg") mimeType = "image/jpeg";

      const uploadResult = await uploadApi.uploadSingle({
        uri: selectedImage,
        name: fileName,
        type: mimeType,
      });

      return uploadResult.data.url;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Upload Error",
        error.response?.data?.message || "Failed to upload image"
      );
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setLoading(true);

      // Upload image if a new one was selected
      let avatarUrl = avatar;
      if (selectedImage) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
          setAvatar(uploadedUrl);
        } else {
          // If upload failed, don't proceed
          setLoading(false);
          return;
        }
      }

      const updateData: UpdateProfileRequest = {
        name: name.trim(),
      };

      if (phoneNumber.trim()) {
        updateData.phone_number = phoneNumber.trim();
      }

      if (avatarUrl && avatarUrl.trim()) {
        updateData.avatar = avatarUrl.trim();
        console.log("Updating profile with avatar URL:", avatarUrl);
      }

      if (gender) {
        updateData.gender = gender;
      }

      await authApi.updateProfile(updateData);
      Alert.alert("Success", "Profile updated successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Profile update error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#212121" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {selectedImage || avatar ? (
                  <Image
                    source={{ uri: selectedImage || avatar }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={40} color="#9E9E9E" />
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons name="camera" size={20} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Tap to change avatar</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+84938123456"
                placeholderTextColor="#9E9E9E"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {["male", "female", "other"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      gender === g && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender(g as "male" | "female" | "other")}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === g && styles.genderButtonTextActive,
                      ]}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212121",
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 20,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarHint: {
    fontSize: 12,
    color: "#757575",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212121",
    backgroundColor: "#FAFAFA",
  },
  genderContainer: {
    flexDirection: "row",
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  genderButtonActive: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E9",
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  genderButtonTextActive: {
    color: "#4CAF50",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757575",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default DriverEditProfileModal;
