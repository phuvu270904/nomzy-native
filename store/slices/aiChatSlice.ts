import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string format for Redux serialization
}

interface AIChatState {
  isEnabled: boolean;
  isChatOpen: boolean;
  messages: AIMessage[];
  isLoading: boolean;
}

const initialState: AIChatState = {
  isEnabled: true, // Default is ON
  isChatOpen: false,
  messages: [],
  isLoading: false,
};

const aiChatSlice = createSlice({
  name: "aiChat",
  initialState,
  reducers: {
    toggleAIChat: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload;
    },
    openChat: (state) => {
      state.isChatOpen = true;
    },
    closeChat: (state) => {
      state.isChatOpen = false;
    },
    addMessage: (state, action: PayloadAction<AIMessage>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  toggleAIChat,
  openChat,
  closeChat,
  addMessage,
  setLoading,
  clearMessages,
} = aiChatSlice.actions;

export default aiChatSlice.reducer;
