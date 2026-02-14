import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Yukti",
  description: "Yukti privacy policy — how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          Yukti
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p>
            <strong>Last updated:</strong> February 2026
          </p>
          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including your name, email address, and
            resume content you create using our platform.
          </p>
          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p>
            Your information is used to provide and improve our resume building services,
            authenticate your account, and communicate with you about your account.
          </p>
          <h2 className="text-xl font-semibold text-gray-900">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information.
            Your resume data is encrypted in transit and at rest.
          </p>
          <h2 className="text-xl font-semibold text-gray-900">4. Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please contact us at{" "}
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
