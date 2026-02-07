"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { AuthCard } from "@/components/auth";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        // Handle OAuth error
        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        if (!code) {
          throw new Error("No authorization code received");
        }

        // Verify state for CSRF protection
        const savedState = localStorage.getItem("oauth_state");
        if (state && savedState && state !== savedState) {
          throw new Error("Invalid state parameter - possible CSRF attack");
        }

        // Exchange code for tokens
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const response = await fetch(`${baseUrl}/auth/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Device-Id": getOrCreateDeviceId(),
            "X-Device-Name": getBrowserName(),
            "X-Device-Type": getDeviceType(),
          },
          body: JSON.stringify({
            code,
            redirectUri: window.location.origin + "/auth/callback",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Authentication failed");
        }

        // Store tokens
        if (data.tokens) {
          sessionStorage.setItem("accessToken", data.tokens.accessToken);
          sessionStorage.setItem("idToken", data.tokens.idToken);
        }

        if (data.session) {
          localStorage.setItem("deviceId", data.session.deviceId);
        }

        // Clean up state
        localStorage.removeItem("oauth_state");

        setStatus("success");

        // Notify about removed devices
        if (data.removedDevices && data.removedDevices.length > 0) {
          console.log("Devices removed due to limit:", data.removedDevices);
        }

        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError(err instanceof Error ? err.message : "Authentication failed");
        setStatus("error");
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <AuthCard
        title="Signing you in..."
        subtitle="Please wait while we complete the authentication"
      >
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 size={48} className="animate-spin text-indigo-600" />
          <p className="text-gray-600">Completing authentication...</p>
        </div>
      </AuthCard>
    );
  }

  if (status === "success") {
    return (
      <AuthCard title="Welcome!" subtitle="You've been signed in successfully">
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
          <Loader2 size={24} className="animate-spin text-indigo-600" />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Authentication failed" subtitle="There was a problem signing you in">
      <div className="flex flex-col items-center gap-4 py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle size={32} className="text-red-600" />
        </div>
        <p className="text-center text-red-600">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/auth/login")}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Try again
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go home
          </button>
        </div>
      </div>
    </AuthCard>
  );
}

// Utility functions for device identification
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = `dev_${crypto.randomUUID()}`;
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Browser";
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return "mobile";
  if (/Tablet|iPad/i.test(ua)) return "tablet";
  return "web";
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthCard title="Loading..." subtitle="Please wait">
          <div className="flex justify-center py-8">
            <Loader2 size={32} className="animate-spin text-indigo-600" />
          </div>
        </AuthCard>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
