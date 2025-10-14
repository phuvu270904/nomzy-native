import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export interface MapViewRef {
  updateDriverLocation: (lat: number, lng: number) => void;
  updateOrderStatus: (status: string) => void;
}

interface MapViewProps {
  latitude?: number;
  longitude?: number;
  driverLocation?: { latitude: number; longitude: number };
  customerLocation?: { latitude: number; longitude: number };
  restaurantLocation?: { latitude: number; longitude: number };
  orderStatus?:
    | "pending"
    | "preparing"
    | "ready"
    | "picked_up"
    | "out_for_delivery"
    | "delivered";
  style?: any;
  showRoute?: boolean;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(
  (
    {
      latitude = 37.7749,
      longitude = -122.4194,
      driverLocation,
      customerLocation,
      restaurantLocation,
      orderStatus = "pending",
      style,
      showRoute = true,
    },
    ref,
  ) => {
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
        <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />
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
            .restaurant-icon {
                background: #FF9500;
                color: white;
                border: 3px solid white;
            }
            /* Hide routing machine instructions panel */
            .leaflet-routing-container {
                display: none;
            }
            .leaflet-routing-alternatives-container {
                display: none;
            }
            .leaflet-routing-geocoders {
                display: none;
            }
            /* Style the route line */
            .leaflet-routing-line {
                z-index: 6;
            }
            /* Ensure proper mobile rendering */
            .leaflet-control-container .leaflet-routing-container-hide {
                display: none !important;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
            crossorigin=""></script>
        <script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js"></script>
        
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
            
            var driverMarker, customerMarker, restaurantMarker, routingControl;
            var orderStatus = '${orderStatus}';
            var showRouteEnabled = ${showRoute};
            
            console.log('Order Status:', orderStatus);
            console.log('Show Route:', showRouteEnabled);
            // Add driver marker
            ${
              driverLocation
                ? `
            console.log('Adding driver marker at:', ${driverLocation.latitude}, ${driverLocation.longitude});
            var driverIcon = L.divIcon({
                className: 'custom-div-icon driver-icon',
                html: '🚗',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            driverMarker = L.marker([${driverLocation.latitude}, ${driverLocation.longitude}], {
                icon: driverIcon
            }).addTo(map).bindPopup('Driver Location');
            console.log('Driver marker added successfully');
            `
                : "console.log('No driver location provided');"
            }
            
            // Add restaurant marker
            ${
              restaurantLocation
                ? `
            console.log('Adding restaurant marker at:', ${restaurantLocation.latitude}, ${restaurantLocation.longitude});
            var restaurantIcon = L.divIcon({
                className: 'custom-div-icon restaurant-icon',
                html: '🍽️',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            restaurantMarker = L.marker([${restaurantLocation.latitude}, ${restaurantLocation.longitude}], {
                icon: restaurantIcon
            }).addTo(map).bindPopup('Restaurant Location');
            console.log('Restaurant marker added successfully');
            `
                : "console.log('No restaurant location provided');"
            }
            
            // Add customer marker
            ${
              customerLocation
                ? `
            console.log('Adding customer marker at:', ${customerLocation.latitude}, ${customerLocation.longitude});
            var customerIcon = L.divIcon({
                className: 'custom-div-icon customer-icon',
                html: '📍',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
            
            customerMarker = L.marker([${customerLocation.latitude}, ${customerLocation.longitude}], {
                icon: customerIcon
            }).addTo(map).bindPopup('Delivery Location');
            console.log('Customer marker added successfully');
            `
                : "console.log('No customer location provided');"
            }
            
            // Function to draw route based on order status
            function drawRoute() {
                console.log('drawRoute called, orderStatus:', orderStatus);
                
                // Remove existing route
                if (routingControl) {
                    map.removeControl(routingControl);
                    routingControl = null;
                }
                
                if (!driverMarker || !showRouteEnabled) {
                    console.log('Cannot draw route: driverMarker=', !!driverMarker, 'showRouteEnabled=', showRouteEnabled);
                    return;
                }
                
                var startPoint = driverMarker.getLatLng();
                var endPoint;
                var routeColor = '#4CAF50';
                var routeLabel = '';
                
                console.log('Driver position:', startPoint);
                
                // Determine destination based on order status
                if (orderStatus === 'out_for_delivery' && customerMarker) {
                    endPoint = customerMarker.getLatLng();
                    routeColor = '#FF6B35';
                    routeLabel = 'Route to Customer';
                    console.log('Drawing route to customer:', endPoint);
                } else if (restaurantMarker && (orderStatus === 'pending' || orderStatus === 'preparing' || orderStatus === 'ready' || orderStatus === 'picked_up')) {
                    endPoint = restaurantMarker.getLatLng();
                    routeColor = '#FF9500';
                    routeLabel = 'Route to Restaurant';
                    console.log('Drawing route to restaurant:', endPoint);
                }
                
                if (endPoint) {
                    routingControl = L.Routing.control({
                        waypoints: [startPoint, endPoint],
                        routeWhileDragging: false,
                        addWaypoints: false,
                        createMarker: function() { return null; }, // Don't create default markers
                        lineOptions: {
                            styles: [{
                                color: routeColor,
                                weight: 4,
                                opacity: 0.8
                            }]
                        },
                        show: false, // Hide instructions
                        router: L.Routing.osrmv1({
                            serviceUrl: 'https://router.project-osrm.org/route/v1'
                        })
                    }).on('routesfound', function(e) {
                        console.log('Route found successfully');
                        var routes = e.routes;
                        if (routes && routes.length > 0) {
                            var route = routes[0];
                            console.log('Route distance:', route.summary.totalDistance, 'meters');
                            console.log('Route time:', route.summary.totalTime, 'seconds');
                        }
                    }).on('routingerror', function(e) {
                        console.error('Routing error:', e);
                        // Fallback to straight line if routing fails
                        var fallbackLine = L.polyline([startPoint, endPoint], {
                            color: routeColor,
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 10'
                        }).addTo(map);
                    }).addTo(map);
                    
                    console.log('Routing control added successfully');
                    
                    // Fit map to show relevant markers
                    setTimeout(() => {
                        var markersToShow = [driverMarker];
                        if (orderStatus === 'out_for_delivery' && customerMarker) {
                            markersToShow.push(customerMarker);
                        } else if (restaurantMarker) {
                            markersToShow.push(restaurantMarker);
                        }
                        
                        if (markersToShow.length > 1) {
                            var group = new L.featureGroup(markersToShow);
                            map.fitBounds(group.getBounds().pad(0.1));
                        }
                    }, 1000); // Wait for route to load
                } else {
                    console.log('No endpoint found for route');
                }
            }
            
            // Initial route drawing
            if (showRouteEnabled) {
                drawRoute();
            }
            
            // Fit map to show all markers initially
            var allMarkers = [];
            if (driverMarker) allMarkers.push(driverMarker);
            if (restaurantMarker) allMarkers.push(restaurantMarker);
            if (customerMarker) allMarkers.push(customerMarker);
            
            if (allMarkers.length > 0) {
                var allMarkersGroup = new L.featureGroup(allMarkers);
                map.fitBounds(allMarkersGroup.getBounds().pad(0.2));
            }
            
            // Function to update driver location
            function updateDriverLocation(lat, lng) {
                if (driverMarker) {
                    driverMarker.setLatLng([lat, lng]);
                    // Redraw route with new driver position
                    drawRoute();
                }
            }
            
            // Function to update order status
            function updateOrderStatus(newStatus) {
                orderStatus = newStatus;
                drawRoute();
            }
            
            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
                var data = JSON.parse(event.data);
                if (data.type === 'updateDriverLocation') {
                    updateDriverLocation(data.latitude, data.longitude);
                } else if (data.type === 'updateOrderStatus') {
                    updateOrderStatus(data.status);
                }
            });
            
            // For debugging
            console.log('Map initialized successfully');
        </script>
    </body>
    </html>
  `;

    // Function to update driver location (exported for external use)
    const updateDriverLocation = (lat: number, lng: number) => {
      const message = JSON.stringify({
        type: "updateDriverLocation",
        latitude: lat,
        longitude: lng,
      });

      webViewRef.current?.postMessage(message);
    };

    // Function to update order status (exported for external use)
    const updateOrderStatus = (status: string) => {
      const message = JSON.stringify({
        type: "updateOrderStatus",
        status: status,
      });

      webViewRef.current?.postMessage(message);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      updateDriverLocation,
      updateOrderStatus,
    }));

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
          onMessage={(event) => {
            console.log("WebView message:", event.nativeEvent.data);
          }}
          onLoadEnd={() => console.log("WebView loaded successfully")}
          onLoadStart={() => console.log("WebView started loading")}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  webview: {
    flex: 1,
  },
});
