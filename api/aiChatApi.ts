import apiClient from "@/utils/apiClient";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResponse {
  message: {
    role: "assistant";
    content: string;
  };
}

// System prompt to train the AI as a food assistant
const SYSTEM_PROMPT = `You are a helpful food assistant for Nomzy, a food delivery app. Your role is to help users discover delicious food based on their preferences.

Guidelines:
- Keep responses SHORT and conversational (1-3 sentences max)
- Be friendly and enthusiastic about food
- Ask clarifying questions when needed
- Suggest specific dishes or categories based on user preferences
- Help users narrow down choices based on taste, cuisine, or dietary needs
- When users express cravings (sweet, sour, spicy, etc.), recommend matching dishes
- Never make up restaurant or dish names - work with available categories

Available food categories: Burgers, Pizza, Sushi, Thai Food, Italian, Chinese, Mexican, Vietnamese, Indian, Japanese, Korean, Desserts, Salads, BBQ, Seafood

Start conversations by asking what they're craving or what taste they prefer today.`;

export const aiChatApi = {
  // Send a chat message and get response
  sendMessage: async (messages: ChatMessage[]): Promise<ChatResponse> => {
    // Prepend system prompt if not already present
    const messagesWithSystem = messages[0]?.role === "system" 
      ? messages 
      : [{ role: "system" as const, content: SYSTEM_PROMPT }, ...messages];

    const response = await apiClient.post("/ai-suggest/chat", {
      messages: messagesWithSystem,
      enableReasoning: false, // Keep responses fast and simple
    });

    return response.data;
  },

  // Get initial greeting message
  getGreeting: (): string => {
    return "Hello! 👋 What do you want to eat today? I can help you find the perfect meal!";
  },
};
