import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { fetchAuthSession } from "aws-amplify/auth";
import { API_BASE_URL } from "./amplify-config";

// Token refresh threshold - refresh when less than 5 minutes left
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

// Pending refresh promise to prevent multiple simultaneous refreshes
let refreshPromise: Promise<string | null> | null = null;

// Get device ID from localStorage
function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("deviceId") || "";
}

// Check if token needs refresh
async function getValidToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    const accessToken = session.tokens?.accessToken;

    if (!accessToken) return null;

    // Check if token is about to expire
    const expiresAt = (accessToken.payload?.exp as number) * 1000;
    const now = Date.now();

    if (expiresAt - now < TOKEN_REFRESH_THRESHOLD_MS) {
      // Token expiring soon, force refresh
      if (!refreshPromise) {
        refreshPromise = refreshToken();
      }
      return await refreshPromise;
    }

    return accessToken.toString();
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}

// Refresh the token
async function refreshToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession({ forceRefresh: true });
    return session.tokens?.accessToken?.toString() || null;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  } finally {
    refreshPromise = null;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor - add auth token and device info
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await getValidToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add device headers
      const deviceId = getDeviceId();
      if (deviceId) {
        config.headers["X-Device-Id"] = deviceId;
      }
    } catch (error) {
      console.error("Error in request interceptor:", error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors and retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const newToken = await refreshToken();

        if (newToken) {
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed on retry:", refreshError);
      }

      // Redirect to login if refresh fails
      if (typeof window !== "undefined") {
        // Clear any stored tokens
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("idToken");

        // Redirect to login
        window.location.href = "/auth/login";
      }
    }

    // Handle other error statuses
    if (error.response?.status === 403) {
      console.error("Access forbidden:", error.response.data);
    }

    if (error.response?.status === 429) {
      console.error("Rate limited:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Export helper for manual token refresh
export { refreshToken, getValidToken };
