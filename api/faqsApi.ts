import { apiClient } from "@/utils/apiClient";

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  isActive: boolean;
  type: "user" | "driver";
  createdAt: string;
  updatedAt: string;
}

export const faqsApi = {
  getFAQs: async (type: "user" | "driver"): Promise<FAQ[]> => {
    const response = await apiClient.get(`/faqs?type=${type}`);
    return response.data;
  },
};
