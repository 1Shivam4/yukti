"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Sparkles, Zap, MessageSquare, FileText } from "lucide-react";

export default function AIAssistantPage() {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-500 mt-1">Get AI-powered help with your resume content</p>
        </div>

        {/* Coming Soon Card */}
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">AI Assistant Coming Soon</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            We&apos;re building a powerful AI assistant that will help you craft compelling resume
            content, improve bullet points, and optimize for ATS systems.
          </p>

          {/* Feature Preview */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span className="text-xs font-medium text-gray-700">Chat Interface</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-medium text-gray-700">Smart Suggestions</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100">
              <FileText className="w-5 h-5 text-green-500" />
              <span className="text-xs font-medium text-gray-700">Content Generation</span>
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            Meanwhile, you can use the <strong>AI Assist</strong> button inside the resume editor
            for content suggestions.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
