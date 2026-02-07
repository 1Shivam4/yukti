"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  signIn,
  signOut,
  signUp,
  fetchAuthSession,
  type SignInInput,
  type SignUpInput,
} from "aws-amplify/auth";
import { configureAmplify } from "@/lib/amplify-config";

configureAmplify();

interface User {
  userId: string;
  email: string;
  name?: string;
  plan?: "FREE" | "PRO";
}

interface Session {
  deviceId: string;
  deviceName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  session: Session | null;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  signOut: (options?: { allDevices?: boolean }) => Promise<void>;
  refreshSession: () => Promise<string | null>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token refresh threshold - refresh when less than 5 minutes left
const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

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

// Helper to get browser name
function getBrowserName(): string {
  if (typeof window === "undefined") return "Unknown";

  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Browser";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Clear refresh timer
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Schedule token refresh
  const scheduleTokenRefresh = useCallback(
    (expiresInMs: number) => {
      clearRefreshTimer();

      // Refresh 5 minutes before expiry
      const refreshInMs = Math.max(expiresInMs - TOKEN_REFRESH_THRESHOLD_MS, 30000);

      console.log(`Scheduling token refresh in ${Math.round(refreshInMs / 1000 / 60)} minutes`);

      refreshTimerRef.current = setTimeout(async () => {
        console.log("Auto-refreshing tokens...");
        await refreshSession();
      }, refreshInMs);
    },
    [clearRefreshTimer]
  );

  // Refresh session tokens
  const refreshSession = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current) {
      console.log("Token refresh already in progress");
      return null;
    }

    isRefreshingRef.current = true;

    try {
      const authSession = await fetchAuthSession({ forceRefresh: true });
      const accessToken = authSession.tokens?.accessToken?.toString();

      if (accessToken && authSession.tokens?.accessToken?.payload?.exp) {
        const expiresAt = authSession.tokens.accessToken.payload.exp * 1000;
        const expiresInMs = expiresAt - Date.now();
        scheduleTokenRefresh(expiresInMs);
      }

      return accessToken || null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [scheduleTokenRefresh]);

  // Get current access token (with refresh if needed)
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const authSession = await fetchAuthSession();
      const accessToken = authSession.tokens?.accessToken;

      if (!accessToken) return null;

      // Check if token is about to expire
      const expiresAt = (accessToken.payload?.exp as number) * 1000;
      const now = Date.now();

      if (expiresAt - now < TOKEN_REFRESH_THRESHOLD_MS) {
        // Token expiring soon, refresh it
        return await refreshSession();
      }

      return accessToken.toString();
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }, [refreshSession]);

  // Check current user on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        const authSession = await fetchAuthSession();

        setUser({
          userId: currentUser.userId,
          email: currentUser.signInDetails?.loginId || "",
          name: currentUser.username,
        });

        setSession({
          deviceId: getDeviceId(),
          deviceName: getBrowserName(),
        });

        // Schedule token refresh based on current token expiry
        if (authSession.tokens?.accessToken?.payload?.exp) {
          const expiresAt = authSession.tokens.accessToken.payload.exp * 1000;
          const expiresInMs = expiresAt - Date.now();
          scheduleTokenRefresh(expiresInMs);
        }
      } catch (error) {
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    return () => {
      clearRefreshTimer();
    };
  }, [scheduleTokenRefresh, clearRefreshTimer]);

  // Handle sign in
  const handleSignIn = async (input: SignInInput) => {
    const result = await signIn(input);

    if (result.isSignedIn) {
      const currentUser = await getCurrentUser();
      const authSession = await fetchAuthSession();

      setUser({
        userId: currentUser.userId,
        email: currentUser.signInDetails?.loginId || "",
        name: currentUser.username,
      });

      setSession({
        deviceId: getDeviceId(),
        deviceName: getBrowserName(),
      });

      // Schedule token refresh
      if (authSession.tokens?.accessToken?.payload?.exp) {
        const expiresAt = authSession.tokens.accessToken.payload.exp * 1000;
        const expiresInMs = expiresAt - Date.now();
        scheduleTokenRefresh(expiresInMs);
      }

      // Sync session with backend
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const token = authSession.tokens?.idToken?.toString();
        const refreshToken = authSession.tokens?.accessToken?.toString(); // Using access token for now

        await fetch(`${baseUrl}/auth/signin`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Device-Id": getDeviceId(),
            "X-Device-Name": getBrowserName(),
            "X-Device-Type": "web",
          },
          body: JSON.stringify({
            email: currentUser.signInDetails?.loginId,
            // Note: password is not sent here, just syncing session
          }),
        });
      } catch (syncError) {
        console.error("Session sync failed:", syncError);
        // Continue anyway - user is still signed in
      }
    }
  };

  // Handle sign up
  const handleSignUp = async (input: SignUpInput) => {
    await signUp(input);
  };

  // Handle sign out
  const handleSignOut = async (options?: { allDevices?: boolean }) => {
    clearRefreshTimer();

    try {
      // Notify backend to revoke session
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const authSession = await fetchAuthSession();
      const token = authSession.tokens?.idToken?.toString();

      if (token) {
        await fetch(`${baseUrl}/auth/signout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Device-Id": getDeviceId(),
          },
          body: JSON.stringify({
            allDevices: options?.allDevices,
          }),
        }).catch(() => {
          // Ignore errors - we're signing out anyway
        });
      }
    } catch {
      // Ignore errors
    }

    // Sign out from Amplify
    await signOut({ global: options?.allDevices ?? false });
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        session,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        refreshSession,
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
