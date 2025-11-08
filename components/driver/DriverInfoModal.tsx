import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";

interface DriverInfoModalProps {
  visible: boolean;
  onClose: () => void;
  driverInfo: {
    id?: string | number;
    name?: string;
    rating?: number | string;
    vehicle?: string;
    phone?: string;
    photo?: string;
    plateNumber?: string;
    estimatedArrival?: string;
  };
  onChatModal: () => void;
}

export function DriverInfoModal({
  visible,
  onClose,
  driverInfo,
  onChatModal,
}: DriverInfoModalProps) {
  const handleCall = () => {
    if (driverInfo?.phone) {
      Linking.openURL(`tel:${driverInfo.phone}`);
    } else {
      Alert.alert("Call unavailable", "Driver phone number not available");
    }
  };

  const handleMessage = () => {
    onChatModal()
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.modalContainer}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />
          
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>Driver Information</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>

          {/* Driver Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {driverInfo?.photo ? (
                <Image
                  source={{ uri: driverInfo.photo }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#4CAF50" />
                </View>
              )}
            </View>

            <View style={styles.driverInfo}>
              <ThemedText style={styles.driverName}>
                {driverInfo?.name || "Super Driver"}
              </ThemedText>
              
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <ThemedText style={styles.rating}>
                  {driverInfo?.rating || "4.9"}
                </ThemedText>
                <ThemedText style={styles.ratingText}>
                  • {driverInfo?.plateNumber || "ABC-123"}
                </ThemedText>
              </View>

              {driverInfo?.estimatedArrival && (
                <View style={styles.arrivalContainer}>
                  <Ionicons name="time-outline" size={16} color="#666666" />
                  <ThemedText style={styles.arrivalText}>
                    Arrives in {driverInfo.estimatedArrival}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          {/* Vehicle Information */}
          <View style={styles.vehicleSection}>
            <View style={styles.vehicleItem}>
              <View style={styles.vehicleIconContainer}>
                <Ionicons name="car-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.vehicleDetails}>
                <ThemedText style={styles.vehicleLabel}>Vehicle</ThemedText>
                <ThemedText style={styles.vehicleValue}>
                  {driverInfo?.vehicle || "Motorbike"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.vehicleItem}>
              <View style={styles.vehicleIconContainer}>
                <Ionicons name="document-text-outline" size={20} color="#4CAF50" />
              </View>
              <View style={styles.vehicleDetails}>
                <ThemedText style={styles.vehicleLabel}>License Plate</ThemedText>
                <ThemedText style={styles.vehicleValue}>
                  {driverInfo?.plateNumber || "ABC-123"}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <ThemedText style={styles.primaryButtonText}>Call Driver</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#4CAF50" />
              <ThemedText style={styles.secondaryButtonText}>Message</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 34, // Safe area for home indicator
    maxHeight: "70%",
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  closeButton: {
    padding: 4,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 14,
    color: "#666666",
  },
  arrivalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrivalText: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 6,
  },
  vehicleSection: {
    marginBottom: 32,
  },
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 4,
  },
  vehicleValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2E2E2E",
  },
  actionSection: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F0F8FF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 8,
  },
});