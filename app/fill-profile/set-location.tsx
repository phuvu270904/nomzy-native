import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/utils/apiClient";

const { height } = Dimensions.get("window");

export default function SetLocationScreen() {
  const params = useLocalSearchParams();
  const { user, fetchUserProfile } = useAuth();
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const avatarUri = params.avatarUri as string;
  const gender = params.gender as string;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant location permission to set your address."
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude: lat, longitude: lng } = location.coords;

      setLatitude(lat);
      setLongitude(lng);

      // Reverse geocode to get address
      const addresses = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        setStreetAddress(
          `${address.street || ""} ${address.streetNumber || ""}`.trim()
        );
        setCity(address.city || "");
        setCountry(address.country || "");
      }
    } catch (error) {
      console.error("Error getting location:", error);
      // Set default location (New York)
      setLatitude(40.7128);
      setLongitude(-74.006);
      setCity("New York");
      setCountry("USA");
    }
  };

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "markerMoved") {
        setLatitude(data.lat);
        setLongitude(data.lng);

        // Reverse geocode to get address
        Location.reverseGeocodeAsync({
          latitude: data.lat,
          longitude: data.lng,
        })
          .then((addresses) => {
            if (addresses && addresses.length > 0) {
              const address = addresses[0];
              setStreetAddress(
                `${address.street || ""} ${address.streetNumber || ""}`.trim()
              );
              setCity(address.city || "");
              setCountry(address.country || "");
            }
          })
          .catch((error) => {
            console.error("Error reverse geocoding:", error);
          });
      } else if (data.type === "mapReady") {
        setIsMapReady(true);
      }
    } catch (error) {
      console.error("Error handling map message:", error);
    }
  };

  const handleConfirm = async () => {
    if (!streetAddress.trim()) {
      Alert.alert("Error", "Please enter your street address");
      return;
    }

    if (!city.trim()) {
      Alert.alert("Error", "Please enter your city");
      return;
    }

    if (!country.trim()) {
      Alert.alert("Error", "Please enter your country");
      return;
    }

    if (!latitude || !longitude) {
      Alert.alert("Error", "Please select your location on the map");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Upload avatar
      let avatarUrl = "";
      if (avatarUri) {
        const formData = new FormData();
        const filename = avatarUri.split("/").pop() || "avatar.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("file", {
          uri: avatarUri,
          name: filename,
          type,
        } as any);

        const uploadResponse = await apiClient.post(
          "/upload/single",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        avatarUrl = uploadResponse.data.data.url;
      }

      // Step 2: Update profile with avatar and gender
      await apiClient.post("/auth/updateProfile", {
        gender,
        avatar: avatarUrl,
      });

      // Step 3: Create address
      await apiClient.post("/addresses", {
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        country: country.trim(),
        isDefault: true,
        latitude,
        longitude,
      });

      // Step 4: Mark profile as fully registered
      await apiClient.post("/auth/updateProfile", {
        isFullyRegistered: true,
      });

      // Fetch updated profile
      await fetchUserProfile();

      // Navigate to home based on user role
      if (user?.jwt?.role === "driver") {
        router.replace("/(driver-tabs)");
      } else {
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.error("Error completing profile:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to complete profile. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100vh; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const initialLat = ${latitude || 40.7128};
        const initialLng = ${longitude || -74.006};
        
        const map = L.map('map').setView([initialLat, initialLng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
        
        marker.on('dragend', function(e) {
          const position = marker.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerMoved',
            lat: position.lat,
            lng: position.lng
          }));
        });

        map.on('click', function(e) {
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerMoved',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        });
        
        setTimeout(() => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
        }, 500);
      </script>
    </body>
    </html>
  `;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Set Your Location</ThemedText>
        <View style={styles.backButton} />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {!isMapReady && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.mapLoadingText}>
              Loading map...
            </ThemedText>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          onMessage={handleMapMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>

      {/* Address Form */}
      <View style={styles.formContainer}>
        <ThemedText style={styles.formTitle}>Address Details</ThemedText>

        <TextInput
          style={styles.input}
          placeholder="Street Address"
          placeholderTextColor="#9E9E9E"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />

        <View style={styles.rowInputs}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="City"
            placeholderTextColor="#9E9E9E"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Country"
            placeholderTextColor="#9E9E9E"
            value={country}
            onChangeText={setCountry}
          />
        </View>

        <TouchableOpacity
          style={[styles.confirmButton, isLoading && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.confirmButtonText}>
              Confirm & Continue
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  mapContainer: {
    height: height * 0.4,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  mapLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  formContainer: {
    flex: 1,
    padding: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2E2E2E",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#2E2E2E",
    marginBottom: 16,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
