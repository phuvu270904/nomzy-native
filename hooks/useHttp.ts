import { apiClient } from "@/utils/apiClient";
import { AxiosError, AxiosRequestConfig } from "axios";
import { useState } from "react";

interface HttpState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseHttpOptions extends Omit<AxiosRequestConfig, "method" | "data"> {
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError) => void;
}

const createHttpHook = (method: string) => {
  return <T = any>(url: string, options: UseHttpOptions = {}) => {
    const { onSuccess, onError, ...axiosConfig } = options;

    const [state, setState] = useState<HttpState<T>>({
      data: null,
      loading: false,
      error: null,
    });

    const execute = async (data?: any) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiClient({
          url,
          method,
          data,
          ...axiosConfig,
        });

        setState({
          data: response.data,
          loading: false,
          error: null,
        });

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage =
          (axiosError.response?.data as any)?.message ||
          axiosError.message ||
          "An error occurred";

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        if (onError) {
          onError(axiosError);
        }

        throw axiosError;
      }
    };

    const reset = () => {
      setState({
        data: null,
        loading: false,
        error: null,
      });
    };

    return {
      ...state,
      execute,
      reset,
    };
  };
};

// Create individual hooks
export const usePost = createHttpHook("POST");
export const usePatch = createHttpHook("PATCH");
export const usePut = createHttpHook("PUT");
export const useDelete = createHttpHook("DELETE");
