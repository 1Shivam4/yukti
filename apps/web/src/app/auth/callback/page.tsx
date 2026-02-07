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
        // Check for error in query params
        const errorParam = searchParams.get("error");
        const errorMessage = searchParams.get("message");

        if (errorParam) {
          throw new Error(errorMessage || errorParam);
        }

        // Check for auth data in URL fragment
        const hash = window.location.hash;
        if (hash && hash.includes("data=")) {
          const encodedData = hash.split("data=")[1];
          if (!encodedData) {
            throw new Error("No authentication data received");
          }

          // Decode the base64url data
          const jsonData = atob(encodedData.replace(/-/g, "+").replace(/_/g, "/"));
          const authData = JSON.parse(jsonData);

          // Store only essential data in localStorage
          if (authData.accessToken) {
            localStorage.setItem("accessToken", authData.accessToken);
          }
          if (authData.user) {
            localStorage.setItem("user", JSON.stringify(authData.user));
          }

          // Clean up URL fragment
          window.history.replaceState(null, "", window.location.pathname);

          setStatus("success");

          // Redirect to dashboard
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
          return;
        }

        // Check if user is already logged in (page refresh after auth)
        const existingToken = localStorage.getItem("accessToken");
        if (existingToken) {
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
          return;
        }

        // No auth data found
        throw new Error("No authentication data received");
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
