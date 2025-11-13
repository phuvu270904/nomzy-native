import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { addressApi, AddressResponse } from "@/api/addressApi";
import AddEditAddressModal from "./AddEditAddressModal";

interface ManageAddressesModalProps {
  visible: boolean;
  onClose: () => void;
}

const ManageAddressesModal: React.FC<ManageAddressesModalProps> = ({
  visible,
  onClose,
}) => {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addEditModalVisible, setAddEditModalVisible] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressResponse | null>(null);

  useEffect(() => {
    if (visible) {
      fetchAddresses();
    }
  }, [visible]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressApi.getAllAddresses();
      setAddresses(data);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load addresses"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      setRefreshing(true);
      const currentAddress = addresses.find((addr) => addr.id === addressId);
      
      if (currentAddress) {
        await addressApi.updateAddress(addressId, {
          ...currentAddress,
          isDefault: true,
        });
        Alert.alert("Success", "Default address updated");
        fetchAddresses();
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to set default address"
      );
      setRefreshing(false);
    }
  };

  const handleDeleteAddress = async (addressId: number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setRefreshing(true);
              await addressApi.deleteAddress(addressId);
              Alert.alert("Success", "Address deleted successfully");
              fetchAddresses();
            } catch (error: any) {
              Alert.alert(
                "Error",
                error.response?.data?.message || "Failed to delete address"
              );
              setRefreshing(false);
            }
          },
        },
      ]
    );
  };

  const handleEditAddress = (address: AddressResponse) => {
    setSelectedAddress(address);
    setAddEditModalVisible(true);
  };

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setAddEditModalVisible(true);
  };

  const renderAddressItem = (address: AddressResponse) => (
    <View key={address.id} style={styles.addressItem}>
      <View style={styles.addressHeader}>
        <View style={styles.addressLabelContainer}>
          <Ionicons
            name={
              address.label === "Home"
                ? "home"
                : address.label === "Work"
                ? "briefcase"
                : "location"
            }
            size={20}
            color="#1BAC4B"
          />
          <Text style={styles.addressLabel}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <View style={styles.addressActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(address.id)}
            disabled={address.isDefault || refreshing}
          >
            <Ionicons
              name={address.isDefault ? "star" : "star-outline"}
              size={20}
              color={address.isDefault ? "#FFB900" : "#757575"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditAddress(address)}
            disabled={refreshing}
          >
            <Ionicons name="pencil-outline" size={20} color="#3498DB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteAddress(address.id)}
            disabled={refreshing}
          >
            <Ionicons name="trash-outline" size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.addressText}>{address.streetAddress}</Text>
      <Text style={styles.addressText}>
        {address.city}, {address.state} {address.postalCode}
      </Text>
      <Text style={styles.addressText}>{address.country}</Text>
    </View>
  );

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
            <Text style={styles.headerTitle}>My Addresses</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#212121" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1BAC4B" />
              <Text style={styles.loadingText}>Loading addresses...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.addressList}
              showsVerticalScrollIndicator={false}
            >
              {addresses.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={64} color="#E0E0E0" />
                  <Text style={styles.emptyText}>No addresses found</Text>
                  <Text style={styles.emptySubText}>
                    Add your delivery addresses to get started
                  </Text>
                </View>
              ) : (
                addresses.map(renderAddressItem)
              )}
            </ScrollView>
          )}

          {refreshing && (
            <View style={styles.refreshingIndicator}>
              <ActivityIndicator size="small" color="#1BAC4B" />
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAddress}
            >
              <Ionicons name="add-circle" size={24} color="#1BAC4B" />
              <Text style={styles.addButtonText}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <AddEditAddressModal
        visible={addEditModalVisible}
        address={selectedAddress}
        onClose={() => {
          setAddEditModalVisible(false);
          setSelectedAddress(null);
        }}
        onSuccess={() => {
          fetchAddresses();
          setSelectedAddress(null);
        }}
      />
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
    height: "40%",
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
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#757575",
  },
  addressList: {
    flex: 1,
    padding: 20,
  },
  addressItem: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#212121",
  },
  defaultBadge: {
    backgroundColor: "#1BAC4B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addressActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#757575",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9E9E9E",
    marginTop: 8,
    textAlign: "center",
  },
  refreshingIndicator: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1BAC4B",
  },
});

export default ManageAddressesModal;
