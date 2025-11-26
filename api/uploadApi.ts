import { apiClient } from "@/utils/apiClient";

export const uploadApi = {
  // Upload single file
  uploadSingle: async (file: {
    uri: string;
    name: string;
    type: string;
  }): Promise<any> => {
    const formData = new FormData();
    
    // Append file to form data
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    const response = await apiClient.post<any>(
      "/upload/single",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },
};
