import React, { useEffect } from "react";
import { Alert } from "react-native";

import { aiChatApi } from "@/api/aiChatApi";
import {
    addMessage,
    AIMessage,
    closeChat,
    openChat,
    setLoading,
} from "@/store/slices/aiChatSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";

import { AIChatBubble } from "./AIChatBubble";
import { AIChatModal } from "./AIChatModal";

export const AIChatContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isEnabled, isChatOpen, messages, isLoading } = useAppSelector(
    (state) => state.aiChat
  );

  // Send initial greeting when chat is opened for the first time
  useEffect(() => {
    if (isChatOpen && messages.length === 0) {
      const greeting = aiChatApi.getGreeting();
      const greetingMessage: AIMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: greeting,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(greetingMessage));
    }
  }, [isChatOpen, messages.length]);

  const handleOpenChat = () => {
    dispatch(openChat());
  };

  const handleCloseChat = () => {
    dispatch(closeChat());
  };

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    dispatch(addMessage(userMessage));

    // Set loading state
    dispatch(setLoading(true));

    try {
      // Prepare messages for API (only send role and content)
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add current user message
      apiMessages.push({
        role: "user",
        content: text,
      });

      // Call AI API
      const response = await aiChatApi.sendMessage(apiMessages);

      // Add assistant response
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message.content,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(assistantMessage));
    } catch (error: any) {
      console.error("Error sending message to AI:", error);
      
      // Add error message
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(errorMessage));

      Alert.alert(
        "Error",
        "Failed to get response from AI assistant. Please try again."
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <>
      <AIChatBubble onPress={handleOpenChat} isVisible={isEnabled} />
      <AIChatModal
        visible={isChatOpen}
        onClose={handleCloseChat}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </>
  );
};
