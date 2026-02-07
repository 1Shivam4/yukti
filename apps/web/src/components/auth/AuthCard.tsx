import type { ReactNode } from "react";
import Link from "next/link";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30 blur-3xl" />
      </div>

      {/* Logo */}
      <Link href="/" className="mb-8 flex items-center gap-2 text-2xl font-bold text-indigo-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Yukti
      </Link>

      {/* Card */}
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl shadow-indigo-100/50 border border-white/20 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>

        {/* Additional links */}
        <p className="mt-6 text-center text-sm text-gray-600">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 font-medium">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
