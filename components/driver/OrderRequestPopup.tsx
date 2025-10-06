import { OrderRequest } from "@/hooks/useDriverSocket";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Alert,
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface OrderRequestPopupProps {
  visible: boolean;
  orderRequest: OrderRequest | null;
  onAccept: (orderId: number) => void;
  onDecline: (orderId: number) => void;
  onTimeout?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const OrderRequestPopup: React.FC<OrderRequestPopupProps> = ({
  visible,
  orderRequest,
  onAccept,
  onDecline,
  onTimeout,
}) => {
  const [timeLeft, setTimeLeft] = React.useState(30); // 30 seconds to respond

  // Timer countdown
  React.useEffect(() => {
    if (!visible || !orderRequest) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, auto-decline
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, orderRequest, onTimeout]);

  const handleAccept = () => {
    if (orderRequest) {
      Alert.alert(
        "Accept Order",
        "Are you sure you want to accept this order?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Accept",
            onPress: () => onAccept(orderRequest.orderId),
          },
        ],
      );
    }
  };

  const handleDecline = () => {
    if (orderRequest) {
      onDecline(orderRequest.orderId);
    }
  };

  const formatCurrency = (amount: number, currency: string = "VND") => {
    if (currency === "VND") {
      return `${amount.toLocaleString("vi-VN")}đ`;
    }
    return `${currency} ${amount.toFixed(2)}`;
  };

  const getTimeAgo = (orderTime: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - orderTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes === 1) {
      return "1 minute ago";
    } else {
      return `${diffInMinutes} minutes ago`;
    }
  };

  if (!visible || !orderRequest) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Ionicons name="restaurant" size={24} color="white" />
                <Text style={styles.headerTitle}>New Order Request</Text>
              </View>
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>{timeLeft}s</Text>
              </View>
            </View>
          </View>

          {/* Order Details */}
          <View style={styles.content}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {orderRequest.customerName}
              </Text>
              <Text style={styles.orderTime}>
                {getTimeAgo(orderRequest.orderTime)}
              </Text>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.locationItem}>
                <View style={styles.locationIcon}>
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color="#4CAF50"
                  />
                </View>
                <View style={styles.locationText}>
                  <Text style={styles.locationLabel}>Pickup</Text>
                  <Text style={styles.locationAddress}>
                    {orderRequest.pickupLocation}
                  </Text>
                  {orderRequest.restaurantName && (
                    <Text style={styles.restaurantName}>
                      {orderRequest.restaurantName}
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.locationDivider}>
                <View style={styles.dotLine} />
              </View>

              <View style={styles.locationItem}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location-outline" size={20} color="#FF9800" />
                </View>
                <View style={styles.locationText}>
                  <Text style={styles.locationLabel}>Delivery</Text>
                  <Text style={styles.locationAddress}>
                    {orderRequest.destination}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{orderRequest.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{orderRequest.distance}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="card-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{orderRequest.payment}</Text>
                </View>
              </View>
            </View>

            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>
                {formatCurrency(orderRequest.amount, orderRequest.currency)}
              </Text>
            </View>

            {orderRequest.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes</Text>
                <Text style={styles.notesText}>{orderRequest.notes}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.declineButton]}
              onPress={handleDecline}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.acceptButton]}
              onPress={handleAccept}
            >
              <View style={styles.acceptButtonGradient}>
                <Text style={styles.acceptButtonText}>Accept</Text>
              </View>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: SCREEN_WIDTH - 40,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#4CAF50",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  timerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  customerInfo: {
    marginBottom: 20,
  },
  customerName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  orderTime: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationText: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  locationAddress: {
    fontSize: 16,
    color: "#333",
    marginTop: 2,
    lineHeight: 22,
  },
  restaurantName: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
    marginTop: 4,
  },
  locationDivider: {
    marginLeft: 20,
    marginVertical: 8,
  },
  dotLine: {
    width: 2,
    height: 20,
    backgroundColor: "#ddd",
  },
  orderDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  amountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f0f8f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  amountValue: {
    fontSize: 20,
    color: "#4CAF50",
    fontWeight: "700",
  },
  notesContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  declineButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  acceptButton: {
    overflow: "hidden",
  },
  acceptButtonGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 24,
    backgroundColor: "#4CAF50",
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
