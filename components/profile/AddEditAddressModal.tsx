import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { addressApi, AddressResponse } from "@/api/addressApi";

interface AddEditAddressModalProps {
  visible: boolean;
  address?: AddressResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEditAddressModal: React.FC<AddEditAddressModalProps> = ({
  visible,
  address,
  onClose,
  onSuccess,
}) => {
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (address) {
      setStreetAddress(address.streetAddress);
      setCity(address.city);
      setState(address.state);
      setPostalCode(address.postalCode);
      setCountry(address.country);
      setLabel(address.label as "Home" | "Work" | "Other");
      setLatitude(address.latitude);
      setLongitude(address.longitude);
      setIsDefault(address.isDefault);
    } else {
      // Reset form for new address
      setStreetAddress("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("");
      setLabel("Home");
      setLatitude("");
      setLongitude("");
      setIsDefault(false);
    }
  }, [address, visible]);

  const validateForm = () => {
    if (!streetAddress.trim()) {
      Alert.alert("Error", "Street address is required");
      return false;
    }
    if (!city.trim()) {
      Alert.alert("Error", "City is required");
      return false;
    }
    if (!state.trim()) {
      Alert.alert("Error", "State is required");
      return false;
    }
    if (!postalCode.trim()) {
      Alert.alert("Error", "Postal code is required");
      return false;
    }
    if (!country.trim()) {
      Alert.alert("Error", "Country is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const addressData = {
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
        label,
        latitude: latitude.trim() || "0",
        longitude: longitude.trim() || "0",
        isDefault,
      };

      if (address) {
        // Update existing address
        await addressApi.updateAddress(address.id, addressData);
        Alert.alert("Success", "Address updated successfully");
      } else {
        // Create new address
        await addressApi.createAddress(addressData);
        Alert.alert("Success", "Address added successfully");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          `Failed to ${address ? "update" : "add"} address`
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
            <Text style={styles.headerTitle}>
              {address ? "Edit Address" : "Add New Address"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#212121" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Label *</Text>
              <View style={styles.labelContainer}>
                {(["Home", "Work", "Other"] as const).map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[
                      styles.labelButton,
                      label === l && styles.labelButtonActive,
                    ]}
                    onPress={() => setLabel(l)}
                  >
                    <Ionicons
                      name={
                        l === "Home"
                          ? "home"
                          : l === "Work"
                          ? "briefcase"
                          : "location"
                      }
                      size={20}
                      color={label === l ? "#1BAC4B" : "#757575"}
                    />
                    <Text
                      style={[
                        styles.labelButtonText,
                        label === l && styles.labelButtonTextActive,
                      ]}
                    >
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput
                style={styles.input}
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="123 Main Street"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="New York"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  style={styles.input}
                  value={state}
                  onChangeText={setState}
                  placeholder="NY"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Postal Code *</Text>
                <TextInput
                  style={styles.input}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  placeholder="10001"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country *</Text>
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                placeholder="USA"
                placeholderTextColor="#9E9E9E"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="40.7128"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="-74.006"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsDefault(!isDefault)}
            >
              <View
                style={[
                  styles.checkbox,
                  isDefault && styles.checkboxActive,
                ]}
              >
                {isDefault && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Set as default address</Text>
            </TouchableOpacity>
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
                <Text style={styles.saveButtonText}>
                  {address ? "Update" : "Add"}
                </Text>
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
    paddingBottom: 20,
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
  labelContainer: {
    flexDirection: "row",
    gap: 12,
  },
  labelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
    gap: 6,
  },
  labelButtonActive: {
    borderColor: "#1BAC4B",
    backgroundColor: "#E8F5E9",
  },
  labelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  labelButtonTextActive: {
    color: "#1BAC4B",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#1BAC4B",
    borderColor: "#1BAC4B",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#212121",
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
    backgroundColor: "#1BAC4B",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default AddEditAddressModal;
