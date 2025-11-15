import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { AIMessage } from "@/store/slices/aiChatSlice";

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
  messages: AIMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;

// Quick option categories
const TASTE_OPTIONS = [
  { id: "sweet", label: "🍰 Sweet", value: "I'm craving something sweet" },
  { id: "savory", label: "🍕 Savory", value: "I want something savory" },
  { id: "spicy", label: "🌶️ Spicy", value: "I'm in the mood for spicy food" },
  { id: "sour", label: "🍋 Sour", value: "I'd like something sour" },
  { id: "fresh", label: "🥗 Fresh & Light", value: "I want something fresh and light" },
];

const CATEGORY_OPTIONS = [
  { id: "burgers", label: "🍔 Burgers" },
  { id: "pizza", label: "🍕 Pizza" },
  { id: "sushi", label: "🍣 Sushi" },
  { id: "thai", label: "🍜 Thai Food" },
  { id: "italian", label: "🍝 Italian" },
  { id: "chinese", label: "🥡 Chinese" },
  { id: "mexican", label: "🌮 Mexican" },
  { id: "vietnamese", label: "🍲 Vietnamese" },
  { id: "desserts", label: "🍨 Desserts" },
];

export const AIChatModal: React.FC<AIChatModalProps> = ({
  visible,
  onClose,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState("");
  const [showQuickOptions, setShowQuickOptions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && messages.length > 0) {
      // Scroll to bottom when new messages arrive
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible]);

  useEffect(() => {
    // Hide quick options after first user message
    if (messages.some((m) => m.role === "user")) {
      setShowQuickOptions(false);
    }
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim() && !isLoading) {
      onSendMessage(inputText.trim());
      setInputText("");
      setShowQuickOptions(false);
    }
  };

  const handleQuickOption = (text: string) => {
    onSendMessage(text);
    setShowQuickOptions(false);
  };

  const renderMessage = ({ item }: { item: AIMessage }) => {
    const isUser = item.role === "user";

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={20} color="#FFD700" />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Food Assistant</Text>
              <Text style={styles.headerSubtitle}>Powered by Nomzy</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#4CAF50" />
                <Text style={styles.loadingText}>AI is thinking...</Text>
              </View>
            ) : null
          }
        />

        {/* Quick Options */}
        {showQuickOptions && messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickOptionsContainer}
            contentContainerStyle={styles.quickOptionsContent}
          >
            <View style={styles.quickOptionsSection}>
              <Text style={styles.quickOptionsTitle}>What are you craving?</Text>
              <View style={styles.optionsRow}>
                {TASTE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.quickOption}
                    onPress={() => handleQuickOption(option.value)}
                  >
                    <Text style={styles.quickOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.quickOptionsSection}>
              <Text style={styles.quickOptionsTitle}>Browse by category</Text>
              <View style={styles.optionsRow}>
                {CATEGORY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.quickOption}
                    onPress={() =>
                      handleQuickOption(`Show me ${option.label.split(" ")[1]}`)
                    }
                  >
                    <Text style={styles.quickOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about food..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() && !isLoading ? "#FFFFFF" : "#CCC"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#4CAF50",
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#333",
  },
  userMessageText: {
    color: "#FFFFFF",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  quickOptionsContainer: {
    maxHeight: "12%",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  quickOptionsContent: {
    padding: 16,
  },
  quickOptionsSection: {
    marginRight: 24,
  },
  quickOptionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickOption: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  quickOptionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 32 : 12,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 12,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
    color: "#333",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
});
