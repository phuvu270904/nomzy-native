import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NotificationsScreen = () => {
  return (
    <SafeAreaView>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        Notifications
      </Text>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
