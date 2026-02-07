"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { AuthCard, PasswordInput, SocialLoginButtons } from "@/components/auth";
import { useAuth } from "@/contexts/AuthContext";
import { GuestGuard } from "@/components/auth/AuthGuard";

function LoginContent() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";

      if (errorMessage.includes("NotAuthorizedException") || errorMessage.includes("Incorrect")) {
        setError("Incorrect email or password");
      } else if (errorMessage.includes("UserNotConfirmedException")) {
        // Redirect to verify page
        router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
        return;
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // For social login, redirect to Cognito hosted UI
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
      const response = await fetch(`${baseUrl}/auth/social/google`);
      const data = await response.json();

      if (data.url) {
        // Store state for CSRF protection
        localStorage.setItem("oauth_state", data.state);
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to initiate Google login");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
      const response = await fetch(`${baseUrl}/auth/social/facebook`);
      const data = await response.json();

      if (data.url) {
        localStorage.setItem("oauth_state", data.state);
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Facebook login error:", err);
      setError("Failed to initiate Facebook login");
    }
  };

  const inputClassName =
    "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors";

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account to continue">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            className={inputClassName}
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
            className={inputClassName}
          />
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
            Remember me for 30 days
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>

        {/* Social Login */}
        <SocialLoginButtons
          onGoogleClick={handleGoogleLogin}
          onFacebookClick={handleFacebookLogin}
          isLoading={isLoading}
        />

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-indigo-600 hover:text-indigo-500 font-semibold">
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginContent />
    </GuestGuard>
  );
}
