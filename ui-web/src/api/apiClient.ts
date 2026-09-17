import axios, { AxiosHeaders } from "axios";
import { appConfig } from "../configs/env";
import { queryClient } from "../configs/queryClient";
import { getAccessToken, redirectToSessionExpiredLanding } from "../auth/accessToken";

export const apiClient = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json"
  }
});

interface AuthAwareRequestConfig {
  _sessionExpiredHandled?: boolean;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (!token) {
    return config;
  }

  const headers = AxiosHeaders.from(config.headers);
  headers.set("Authorization", `Bearer ${token}`);
  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const requestConfig = error.config as (typeof error.config & AuthAwareRequestConfig) | undefined;
    if (requestConfig?._sessionExpiredHandled) {
      return Promise.reject(error);
    }

    if (requestConfig) {
      requestConfig._sessionExpiredHandled = true;
    }

    queryClient.clear();
    redirectToSessionExpiredLanding();

    return Promise.reject(error);
  }
);
