import { apiClient } from "@/utils/apiClient";

export interface FAQ {
  id: number;
  question: string;
  answer: string | null;
  isActive: boolean;
  type: "user" | "driver";
  status: "pending" | "replied";
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitQuestionRequest {
  question: string;
  type: "user" | "driver";
}

export const faqsApi = {
  getFAQs: async (type: "user" | "driver"): Promise<FAQ[]> => {
    const response = await apiClient.get(`/faqs?type=${type}`);
    return response.data;
  },

  submitQuestion: async (data: SubmitQuestionRequest): Promise<void> => {
    await apiClient.post("/faqs/submit-question", data);
  },
};
