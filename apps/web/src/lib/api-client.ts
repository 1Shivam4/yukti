import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// API base URL from environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// Get device ID from localStorage
function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("deviceId") || "";
}

// Get access token from localStorage
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
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
      const token = getAccessToken();

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

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // If 401, redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Clear stored auth data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

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

// Export helper for getting token
export { getAccessToken };
