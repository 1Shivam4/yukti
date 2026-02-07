"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { AuthCard, PasswordInput, SocialLoginButtons } from "@/components/auth";
import { GuestGuard } from "@/components/auth/AuthGuard";

function SignupContent() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return "Name is required";
    }
    if (!formData.email.trim()) {
      return "Email is required";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address";
    }
    if (formData.password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    if (!agreedToTerms) {
      return "Please agree to the Terms of Service and Privacy Policy";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      // Redirect to verification page
      router.push(`/auth/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      console.error("Signup error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create account";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
      const response = await fetch(`${baseUrl}/auth/social/google`);
      const data = await response.json();

      if (data.url) {
        localStorage.setItem("oauth_state", data.state);
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google login error:", err);
      setError("Failed to initiate Google signup");
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
      setError("Failed to initiate Facebook signup");
    }
  };

  const inputClassName =
    "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors";

  const passwordsMatch =
    formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <AuthCard title="Create your account" subtitle="Start building amazing resumes with AI">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="John Doe"
            required
            disabled={isLoading}
            className={inputClassName}
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            className={inputClassName}
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <PasswordInput
            id="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Create a strong password"
            required
            disabled={isLoading}
            showStrength
            className={inputClassName}
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <div className="relative">
            <PasswordInput
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              className={inputClassName}
            />
            {passwordsMatch && (
              <CheckCircle
                size={18}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-green-500"
              />
            )}
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
            I agree to the{" "}
            <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </Link>
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
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>

        {/* Social Login */}
        <SocialLoginButtons
          onGoogleClick={handleGoogleLogin}
          onFacebookClick={handleFacebookLogin}
          isLoading={isLoading}
        />

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

export default function SignupPage() {
  return (
    <GuestGuard>
      <SignupContent />
    </GuestGuard>
  );
}
