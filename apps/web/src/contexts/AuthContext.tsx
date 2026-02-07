"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  plan?: "FREE" | "PRO";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ needsVerification: boolean }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => void;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

// Helper to generate/get device ID
function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = `dev_${crypto.randomUUID()}`;
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("accessToken");

        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name,
            plan: userData.plan,
          });
        }
      } catch {
        // Clear invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Get access token from localStorage
  const getAccessToken = useCallback((): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Device-Id": getDeviceId(),
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Sign in failed");
    }

    // Store tokens and user
    if (data.tokens?.accessToken) {
      localStorage.setItem("accessToken", data.tokens.accessToken);
    }
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        plan: data.user.plan,
      });
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name?: string
    ): Promise<{ needsVerification: boolean }> => {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Sign up failed");
      }

      return { needsVerification: true };
    },
    []
  );

  // Verify email with code
  const verifyEmail = useCallback(async (email: string, code: string): Promise<void> => {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, code }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }
  }, []);

  // Sign out
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await fetch(`${API_URL}/auth/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Device-Id": getDeviceId(),
          },
        }).catch(() => {
          // Ignore errors - we're signing out anyway
        });
      }
    } finally {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  // Redirect to Google OAuth
  const signInWithGoogle = useCallback(() => {
    // Generate state for CSRF protection
    const state = `dev_${crypto.randomUUID()}`;
    localStorage.setItem("oauth_state", state);

    // Redirect to API which will redirect to Cognito
    window.location.href = `${API_URL}/auth/social/google`;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        verifyEmail,
        signOut,
        signInWithGoogle,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
