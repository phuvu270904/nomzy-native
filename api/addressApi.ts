import { apiClient } from "@/utils/apiClient";

export interface AddressResponse {
  id: number;
  userId: number;
  streetAddress: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  isDefault: boolean;
  label: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  streetAddress: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  isDefault: boolean;
  label: string;
  latitude: number;
  longitude: number;
}

// Address API functions
export const addressApi = {
  // Get default address for the current user
  getDefaultAddress: async (): Promise<AddressResponse> => {
    const response = await apiClient.get<AddressResponse>("/addresses/default");
    return response.data;
  },

  // Get all addresses for the current user
  getAllAddresses: async (): Promise<AddressResponse[]> => {
    const response = await apiClient.get<AddressResponse[]>("/addresses");
    return response.data;
  },

  // Get address by ID
  getAddressById: async (addressId: number): Promise<AddressResponse> => {
    const response = await apiClient.get<AddressResponse>(
      `/addresses/${addressId}`,
    );
    return response.data;
  },

  // Create new address
  createAddress: async (
    addressData: AddressInput,
  ): Promise<AddressResponse> => {
    const response = await apiClient.post<AddressResponse>(
      "/addresses",
      addressData,
    );
    return response.data;
  },

  // Update address
  updateAddress: async (
    addressId: number,
    addressData: Partial<AddressInput>,
  ): Promise<AddressResponse> => {
    const response = await apiClient.patch<AddressResponse>(
      `/addresses/${addressId}`,
      addressData,
    );
    return response.data;
  },

  // Delete address
  deleteAddress: async (addressId: number): Promise<void> => {
    await apiClient.delete(`/addresses/${addressId}`);
  },

  // Set address as default
  setDefaultAddress: async (addressId: number): Promise<AddressResponse> => {
    const response = await apiClient.patch<AddressResponse>(
      `/addresses/${addressId}/default`,
    );
    return response.data;
  },
};
