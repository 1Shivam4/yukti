import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Yukti",
  description: "Yukti terms of service — rules for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          Yukti
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p>
            <strong>Last updated:</strong> February 2026
          </p>
          <h2 className="text-xl font-semibold text-gray-900">1. Acceptance of Terms</h2>
          <p>
            By using Yukti, you agree to these terms of service. If you do not agree, please do not
            use our platform.
          </p>
          <h2 className="text-xl font-semibold text-gray-900">2. Use of Service</h2>
          <p>
            Yukti provides AI-powered resume building tools. You retain ownership of all content you
            create. You agree to use the service lawfully and not misuse our AI features.
          </p>
          <h2 className="text-xl font-semibold text-gray-900">3. Account Responsibility</h2>
          <p>
            You are responsible for maintaining the security of your account credentials and for all
            activities that occur under your account.
          </p>
          <h2 className="text-xl font-semibold text-gray-900">4. Limitation of Liability</h2>
          <p>
            Yukti is provided &quot;as is&quot; without warranties. We are not liable for any
            damages arising from your use of the platform.
          </p>
          <h2 className="text-xl font-semibold text-gray-900">5. Contact</h2>
          <p>
            For questions about these terms, contact us at{" "}
            <a href="mailto:support@yukti.com" className="text-indigo-600 hover:underline">
              support@yukti.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
