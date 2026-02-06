"use client";

import Link from "next/link";
import { Sparkles, FileText, Download, Zap, Shield, Clock } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            Yukti
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            AI-Powered Resume Builder
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Create Professional Resumes
            <span className="text-indigo-600"> in Minutes</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Build stunning, ATS-friendly resumes with AI assistance. Get hired faster with
            pixel-perfect formatting and smart content suggestions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold text-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300"
            >
              Start Building Free
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold text-lg border border-gray-200"
            >
              See How It Works
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>5 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>AI-powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional resume creation made simple with smart AI features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Content Generation</h3>
              <p className="text-gray-600 leading-relaxed">
                Let AI craft compelling bullet points and summaries based on your experience. Get
                suggestions tailored to your target role.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-green-50 to-white border border-green-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Split-View Editor</h3>
              <p className="text-gray-600 leading-relaxed">
                Edit your resume with real-time preview. See changes instantly as you type with our
                intuitive side-by-side editor.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Export Anywhere</h3>
              <p className="text-gray-600 leading-relaxed">
                Download your resume as a pixel-perfect PDF or DOCX. Ready for job applications and
                ATS systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join thousands of professionals who landed their dream jobs with Yukti
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-semibold text-lg shadow-lg"
          >
            Get Started Now — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-600">© 2024 Yukti. Built with ❤️ for job seekers.</div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-900">
              Privacy
            </Link>
            <Link href="#" className="hover:text-gray-900">
              Terms
            </Link>
            <Link href="#" className="hover:text-gray-900">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
