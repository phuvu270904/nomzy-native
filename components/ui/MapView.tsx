import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  driverLocation?: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number };
  style?: any;
  showRoute?: boolean;
}

export function MapView({
  latitude = 37.7749,
  longitude = -122.4194,
  driverLocation,
  customerLocation,
  style,
  showRoute = true,
}: MapViewProps) {
  const webViewRef = useRef<WebView>(null);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
            crossorigin=""/>
        <style>
            body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }
            #map {
                height: 100vh;
                width: 100vw;
            }
            .custom-div-icon {
                background: white;
                border: 3px solid #4CAF50;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                font-weight: bold;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .driver-icon {
                background: #4CAF50;
                color: white;
                border: 3px solid white;
            }
            .customer-icon {
                background: #FF6B35;
                color: white;
                border: 3px solid white;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
        
        <script>
            // Initialize map
            var map = L.map('map', {
                zoomControl: true,
                attributionControl: false
            }).setView([${latitude}, ${longitude}], 13);
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
            
            var driverMarker, customerMarker, routeLine;
            
            // Add driver marker
            ${
              driverLocation
                ? `
            var driverIcon = L.divIcon({
                className: 'custom-div-icon driver-icon',
                html: '🚗',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            driverMarker = L.marker([${driverLocation.latitude}, ${driverLocation.longitude}], {
                icon: driverIcon
            }).addTo(map).bindPopup('Driver Location');
            `
                : ""
            }
            
            // Add customer marker
            ${
              customerLocation
                ? `
            var customerIcon = L.divIcon({
                className: 'custom-div-icon customer-icon',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            customerMarker = L.marker([${customerLocation.latitude}, ${customerLocation.longitude}], {
                icon: customerIcon
            }).addTo(map).bindPopup('Delivery Location');
            `
                : ""
            }
            
            // Draw route if both locations exist
            ${
              driverLocation && customerLocation && showRoute
                ? `
            routeLine = L.polyline([
                [${driverLocation.latitude}, ${driverLocation.longitude}],
                [${customerLocation.latitude}, ${customerLocation.longitude}]
            ], {
                color: '#4CAF50',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);
            
            // Fit map to show both markers
            var group = new L.featureGroup([driverMarker, customerMarker]);
            map.fitBounds(group.getBounds().pad(0.1));
            `
                : ""
            }
            
            // Function to update driver location
            function updateDriverLocation(lat, lng) {
                if (driverMarker) {
                    driverMarker.setLatLng([lat, lng]);
                    
                    // Update route line if customer location exists
                    ${
                      customerLocation
                        ? `
                    if (routeLine) {
                        routeLine.setLatLngs([
                            [lat, lng],
                            [${customerLocation.latitude}, ${customerLocation.longitude}]
                        ]);
                    }
                    `
                        : ""
                    }
                }
            }
            
            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
                var data = JSON.parse(event.data);
                if (data.type === 'updateDriverLocation') {
                    updateDriverLocation(data.latitude, data.longitude);
                }
            });
            
            // For debugging
            console.log('Map initialized successfully');
        </script>
    </body>
    </html>
  `;

  // Function to update driver location (exported for external use)
  // const updateDriverLocation = (lat: number, lng: number) => {
  //   const message = JSON.stringify({
  //     type: "updateDriverLocation",
  //     latitude: lat,
  //     longitude: lng,
  //   });

  //   webViewRef.current?.postMessage(message);
  // };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onError={(error) => console.error("WebView error:", error)}
        onHttpError={(error) => console.error("WebView HTTP error:", error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  webview: {
    flex: 1,
  },
});
