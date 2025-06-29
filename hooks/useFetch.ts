import { apiClient } from "@/utils/apiClient";
import { AxiosError, AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchOptions extends AxiosRequestConfig {
  skip?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: AxiosError) => void;
}

export const useFetch = <T = any>(
  url: string,
  options: UseFetchOptions = {},
) => {
  const { skip = false, onSuccess, onError, ...axiosConfig } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = async () => {
    if (skip) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient({
        url,
        method: "GET",
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
    }
  };

  useEffect(() => {
    fetchData();
  }, [url, skip]);

  const refetch = () => {
    fetchData();
  };

  return {
    ...state,
    refetch,
  };
};
