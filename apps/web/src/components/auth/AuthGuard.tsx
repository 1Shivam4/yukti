"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

/**
 * AuthGuard - Protects routes from unauthenticated access
 * Redirects to login page if user is not authenticated
 */
export function AuthGuard({ children, fallbackPath = "/auth/login" }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, getAccessToken } = useAuth();
  const [validating, setValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (loading) return;

      // No user, redirect to login
      if (!user) {
        const returnUrl = encodeURIComponent(pathname);
        router.replace(`${fallbackPath}?returnUrl=${returnUrl}`);
        setValidating(false);
        return;
      }

      // User exists, validate token with API
      const token = getAccessToken();
      if (!token) {
        router.replace(`${fallbackPath}`);
        setValidating(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsValid(true);
        } else {
          // Invalid session, clear and redirect
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          router.replace(`${fallbackPath}`);
        }
      } catch {
        // Network error, still allow if we have local data
        setIsValid(true);
      } finally {
        setValidating(false);
      }
    };

    validateSession();
  }, [user, loading, router, pathname, fallbackPath, getAccessToken]);

  // Show loading state while checking auth
  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-600" />
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-600" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * GuestGuard - Protects routes from authenticated access
 * Validates session with backend before redirecting to dashboard
 * Useful for login/signup pages
 */
interface GuestGuardProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function GuestGuard({ children, fallbackPath = "/dashboard" }: GuestGuardProps) {
  const router = useRouter();
  const { user, loading, getAccessToken } = useAuth();
  const [validating, setValidating] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  useEffect(() => {
    const validateSession = async () => {
      if (loading) return;

      // No user, allow access to guest pages
      if (!user) {
        setValidating(false);
        return;
      }

      // User exists in localStorage, validate token with API
      const token = getAccessToken();
      if (!token) {
        // No token, allow access
        setValidating(false);
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
        const response = await fetch(`${apiUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          // Valid session, redirect to dashboard
          setHasValidSession(true);
          router.replace(fallbackPath);
        } else {
          // Invalid session, clear local data and allow access
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
          setHasValidSession(false);
        }
      } catch {
        // Network error, allow access to login
        setHasValidSession(false);
      } finally {
        setValidating(false);
      }
    };

    validateSession();
  }, [user, loading, router, fallbackPath, getAccessToken]);

  // Show loading state while checking auth
  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-600" />
          <p className="text-gray-600">Checking session...</p>
        </div>
      </div>
    );
  }

  // If user has valid session, show redirect message
  if (hasValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-indigo-600" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
